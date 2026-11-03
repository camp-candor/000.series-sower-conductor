import { Model } from '../../99.core/interface/model.interface.js';

export interface DuckingKeyframe {
  frame: number;
  gainDb: number;
  interpolatedGainLinear: number;
}

export interface FoleyPlacement {
  cueName: string;
  sampleKey: string;
  deterministicSeed: number;
  frameOffset: number;
  volumeMultiplier: number;
}

export interface AcousticPacingManifest {
  sceneId: string;
  duckingFloorDb: number;
  attackFrames: number;
  releaseFrames: number;
  duckingTimeline: DuckingKeyframe[];
  foleyPlacements: FoleyPlacement[];
}

export default interface Audio extends Model {
  idx: string;
  defaultDuckingFloorDb: number;
  totalEnvelopesGenerated: number;
  lastPacingManifest: AcousticPacingManifest | null;
}
