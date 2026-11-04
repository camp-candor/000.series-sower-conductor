import { Model } from '../../99.core/interface/model.interface.js';

export type LayerType =
  | 'ENVIRONMENT_MATTE'
  | 'ATMOSPHERE_VECTOR'
  | 'CHARACTER_PLATE'
  | 'OPTICAL_LENS';

export type CameraMotionMode = 'STATIC' | 'SLOW_PUSH_IN' | 'CRASH_ZOOM' | 'IMPACT_SHAKE';

export interface SpringPhysicsConfig {
  mass: number;
  damping: number;
  stiffness: number;
  overshootClamping: boolean;
}

export interface JitterOffsetKeyframe {
  frame: number;
  deltaX: number;
  deltaY: number;
}

export interface CameraKinematicsSpec {
  mode: CameraMotionMode;
  originXPercent: number; // 0 to 100%
  originYPercent: number; // 0 to 100%
  startScale: number;
  targetScale: number;
  springConfig?: SpringPhysicsConfig;
  jitterKeyframes?: JitterOffsetKeyframe[];
}

export interface OpticalMasteringConfig {
  halationIntensityBps: number;
  filmGrainOpacityBps: number;
  colorLookupTable: string;
  enableDespill: boolean;
}

export interface AcousticDuckingKeyframe {
  frame: number;
  gainDb: number;
}

export interface SequenceLayerSpec {
  layerId: string;
  layerType: LayerType;
  assetPath: string;
  fromFrame: number;
  durationInFrames: number;
  trimEndFrames: number;
  zIndex: number;
  transformOriginX: number;
  transformOriginY: number;
  cameraSpec?: CameraKinematicsSpec;
}

export interface CompositionMetadata {
  episodeId: string;
  sceneId: string;
  fps: 24;
  width: 1920;
  height: 1080;
  totalDurationFrames: number;
  outputTsxPath: string;
  layers: SequenceLayerSpec[];
  duckingTimeline: AcousticDuckingKeyframe[];
  opticalConfig: OpticalMasteringConfig;
}

export interface EjectMarkerStatus {
  isLocked: boolean;
  filePath: string;
  lockTimestampMs?: number;
  lockAuthor?: string;
}

export default interface Remotion extends Model {
  idx: string;
  totalCompositionsStamped: number;
  lastStampedPath: string;
  isEjectLocked: boolean;
  compilerVersion: string;
  lastMetadata: CompositionMetadata | null;
}
