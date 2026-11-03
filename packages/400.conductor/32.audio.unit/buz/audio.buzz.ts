import fs from 'node:fs';
import path from 'node:path';
import { AudioModel } from '../audio.model.js';
import AudioBit from '../fce/audio.bit.js';
import State from '../../99.core/state.js';
import {
  DuckingKeyframe,
  FoleyPlacement,
  AcousticPacingManifest,
} from '../fce/audio.interface.js';
import { QuantizedFrameBudget } from '../../24.frame.unit/fce/frame.interface.js';

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

export function computeQuadraticDuckingCurve(
  totalFrames: number,
  speechWindows: Array<{ startFrame: number; endFrame: number }>,
  duckingFloorDb = -14.0,
  attackFrames = 6,
  releaseFrames = 12
): DuckingKeyframe[] {
  const frames: DuckingKeyframe[] = [];

  for (let f = 0; f < totalFrames; f++) {
    let currentGainDb = 0.0;

    for (const win of speechWindows) {
      if (f >= win.startFrame && f <= win.endFrame) {
        // Fully ducked during active speech
        currentGainDb = duckingFloorDb;
        break;
      } else if (f >= win.startFrame - attackFrames && f < win.startFrame) {
        // Quadratic easing down (Attack)
        const t = (f - (win.startFrame - attackFrames)) / attackFrames;
        const gain = duckingFloorDb * Math.pow(t, 2);
        currentGainDb = Math.min(currentGainDb, gain);
      } else if (f > win.endFrame && f <= win.endFrame + releaseFrames) {
        // Quadratic easing recovery (Release)
        const t = 1.0 - (f - win.endFrame) / releaseFrames;
        const gain = duckingFloorDb * Math.pow(t, 2);
        currentGainDb = Math.min(currentGainDb, gain);
      }
    }

    const interpolatedGainLinear = Number(Math.pow(10, currentGainDb / 20).toFixed(4));
    frames.push({
      frame: f,
      gainDb: Number(currentGainDb.toFixed(2)),
      interpolatedGainLinear,
    });
  }

  return frames;
}

export const initAudio = (cpy: AudioModel, bal: AudioBit, _ste: State) => {
  if (bal.slv) bal.slv({ audioBit: { idx: 'init-audio', val: 1 } });
  return cpy;
};

export const generateDuckingEnvelope = (cpy: AudioModel, bal: AudioBit, _ste: State) => {
  const cns = '>> [DUCKING]';
  const sceneId = bal.src || bal.dat?.sceneId || 'scene_000';
  const totalFrames = bal.dat?.totalFrames as number;
  const speechWindows = (bal.dat?.speechWindows || []) as Array<{ startFrame: number; endFrame: number }>;
  const duckingFloorDb = bal.dat?.duckingFloorDb ?? cpy.defaultDuckingFloorDb;
  const attackFrames = bal.dat?.attackFrames ?? 6;
  const releaseFrames = bal.dat?.releaseFrames ?? 12;

  if (!totalFrames || totalFrames <= 0) {
    const err = 'DUCKING_REJECTED: totalFrames must be a positive integer';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ audioBit: { idx: 'generate-ducking-envelope-error', val: 0, src: err } });
    throw new Error(err);
  }

  const duckingTimeline = computeQuadraticDuckingCurve(
    totalFrames,
    speechWindows,
    duckingFloorDb,
    attackFrames,
    releaseFrames
  );

  const foleyCues = (bal.dat?.foleyCues || []) as Array<{ cueName: string; sampleKey: string; frameOffset: number }>;
  const foleyPlacements: FoleyPlacement[] = foleyCues.map((c) => ({
    cueName: c.cueName,
    sampleKey: c.sampleKey,
    deterministicSeed: murmurHash3(`${sceneId}:${c.cueName}:${c.sampleKey}`),
    frameOffset: c.frameOffset,
    volumeMultiplier: 1.0,
  }));

  const manifest: AcousticPacingManifest = {
    sceneId,
    duckingFloorDb,
    attackFrames,
    releaseFrames,
    duckingTimeline,
    foleyPlacements,
  };

  cpy.totalEnvelopesGenerated += 1;
  cpy.lastPacingManifest = manifest;

  process.stdout.write(
    `${cns} [OK] Scene ${sceneId}: Generated ${duckingTimeline.length} ducking frames (${duckingFloorDb}dB floor, ${foleyPlacements.length} Foley cues)\n`
  );

  if (bal.slv) {
    bal.slv({
      audioBit: {
        idx: 'generate-ducking-envelope',
        val: 1,
        src: sceneId,
        dat: manifest,
      },
    });
  }

  return cpy;
};

export const writeExposureSheet = (cpy: AudioModel, bal: AudioBit, _ste: State) => {
  const cns = '>> [EXPOSURE-SHEET]';
  const outputPath = bal.src || bal.dat?.outputPath || path.resolve(process.cwd(), 'drafts/exposure_sheet.json');
  const payload = bal.dat?.manifest;

  if (!payload) {
    const err = 'WRITE_REJECTED: Missing exposure sheet payload in dat.manifest';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ audioBit: { idx: 'write-exposure-sheet-error', val: 0, src: err } });
    throw new Error(err);
  }

  try {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const tmpPath = `${outputPath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
    fs.renameSync(tmpPath, outputPath);

    process.stdout.write(`${cns} [OK] Committed exposure sheet to ${outputPath}\n`);

    if (bal.slv) {
      bal.slv({
        audioBit: {
          idx: 'write-exposure-sheet',
          val: 1,
          src: outputPath,
        },
      });
    }
  } catch (err: any) {
    process.stderr.write(`${cns} [FAIL] ${err.message}\n`);
    if (bal.slv) {
      bal.slv({ audioBit: { idx: 'write-exposure-sheet-error', val: 0, src: err.message } });
    } else {
      throw err;
    }
  }

  return cpy;
};

