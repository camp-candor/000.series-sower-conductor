import { Model } from '../../99.core/interface/model.interface.js';

export interface ShotAcousticProbe {
  shotId: string;
  stemPath: string;
  durationMs: number;
}

export interface QuantizedFrameBudget {
  shotId: string;
  durationMs: number;
  deliveryFps: 24;
  targetFrames: number;
  fromFrame: number;
  toFrame: number;
  diffusionAllocation: number;
  trimEndFrames: number;
  latticeEfficiencyPct: number;
}

export interface ExposureSheetManifest {
  sceneId: string;
  compiledAtMs: number;
  deliveryFps: 24;
  totalDurationMs: number;
  totalDeliveryFrames: number;
  shots: QuantizedFrameBudget[];
}

export default interface Frame extends Model {
  idx: string;
  deliveryFps: number;
  totalScenesQuantized: number;
  lastExposureSheet: ExposureSheetManifest | null;
}
