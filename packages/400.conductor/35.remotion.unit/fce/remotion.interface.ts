import { Model } from '../../99.core/interface/model.interface.js';

export type LayerType =
  | 'ENVIRONMENT_MATTE'
  | 'ATMOSPHERE_VECTOR'
  | 'CHARACTER_PLATE'
  | 'OPTICAL_LENS';

export interface OpticalMasteringConfig {
  halationIntensityBps: number; // 0 to 10000 bps
  filmGrainOpacityBps: number;   // 0 to 10000 bps
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
  transformOriginX: number; // Percentage 0 to 100
  transformOriginY: number; // Percentage 0 to 100
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
