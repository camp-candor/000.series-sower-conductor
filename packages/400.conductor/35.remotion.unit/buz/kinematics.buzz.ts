import {
  CameraKinematicsSpec,
  CameraMotionMode,
  JitterOffsetKeyframe,
  SpringPhysicsConfig,
} from '../fce/remotion.interface.js';

export function calculateCanvasAnchorOrigin(
  stageX: number,
  stageY: number,
  localAnchorX: number,
  localAnchorY: number,
  scale = 1.0,
  canvasWidth = 1920,
  canvasHeight = 1080
): { originXPercent: number; originYPercent: number } {
  // Sprite local anchor is authored in a 1024x1024 normalized coordinate box
  const normalizedOffsetX = (localAnchorX / 1024) * (canvasWidth * 0.5) * scale;
  const normalizedOffsetY = (localAnchorY / 1024) * (canvasHeight * 0.5) * scale;

  const globalX = stageX + normalizedOffsetX;
  const globalY = stageY + normalizedOffsetY;

  const rawOriginX = (globalX / canvasWidth) * 100;
  const rawOriginY = (globalY / canvasHeight) * 100;

  const originXPercent = Number(Math.max(0, Math.min(100, rawOriginX)).toFixed(2));
  const originYPercent = Number(Math.max(0, Math.min(100, rawOriginY)).toFixed(2));

  return { originXPercent, originYPercent };
}

export function murmurHash3(key: string, seed = 0): number {
  let h1 = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  for (let i = 0; i < key.length; i++) {
    let k1 = key.charCodeAt(i);
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

export function createMulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function () {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function synthesizeDeterministicJitterTrajectory(
  sceneId: string,
  shotId: string,
  decayFrames = 14,
  initialIntensityPx = 16.0
): JitterOffsetKeyframe[] {
  const seed = murmurHash3(`${sceneId}:${shotId}:impact_shake`);
  const prng = createMulberry32(seed);
  const trajectory: JitterOffsetKeyframe[] = [];

  for (let t = 0; t < decayFrames; t++) {
    const decay = 1.0 - t / decayFrames;
    const currentIntensity = initialIntensityPx * Math.pow(decay, 1.5);

    const rawDx = (prng() - 0.5) * 2;
    const rawDy = (prng() - 0.5) * 2;

    const deltaX = Number((rawDx * currentIntensity).toFixed(2));
    const deltaY = Number((rawDy * currentIntensity).toFixed(2));

    trajectory.push({ frame: t, deltaX, deltaY });
  }

  return trajectory;
}

export function buildCameraKinematicsSpec(params: {
  sceneId: string;
  shotId: string;
  mode: CameraMotionMode;
  stageX?: number;
  stageY?: number;
  localAnchorX?: number;
  localAnchorY?: number;
  decayFrames?: number;
  initialIntensityPx?: number;
}): CameraKinematicsSpec {
  const { originXPercent, originYPercent } = calculateCanvasAnchorOrigin(
    params.stageX ?? 960,
    params.stageY ?? 900,
    params.localAnchorX ?? 512,
    params.localAnchorY ?? 850
  );

  switch (params.mode) {
    case 'SLOW_PUSH_IN':
      return {
        mode: 'SLOW_PUSH_IN',
        originXPercent,
        originYPercent,
        startScale: 1.0,
        targetScale: 1.05,
      };

    case 'CRASH_ZOOM':
      return {
        mode: 'CRASH_ZOOM',
        originXPercent,
        originYPercent,
        startScale: 1.0,
        targetScale: 1.25,
        springConfig: {
          mass: 0.5,
          damping: 12,
          stiffness: 180,
          overshootClamping: true,
        },
      };

    case 'IMPACT_SHAKE':
      return {
        mode: 'IMPACT_SHAKE',
        originXPercent: 50.0,
        originYPercent: 50.0,
        startScale: 1.02,
        targetScale: 1.02,
        jitterKeyframes: synthesizeDeterministicJitterTrajectory(
          params.sceneId,
          params.shotId,
          params.decayFrames ?? 14,
          params.initialIntensityPx ?? 16.0
        ),
      };

    case 'STATIC':
    default:
      return {
        mode: 'STATIC',
        originXPercent: 50.0,
        originYPercent: 50.0,
        startScale: 1.0,
        targetScale: 1.0,
      };
  }
}
