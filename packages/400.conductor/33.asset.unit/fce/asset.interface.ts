import { Model } from '../../99.core/interface/model.interface.js';

export type PlateRejectionClass =
  | 'ZERO_BYTE_TRUNCATION'
  | 'CHROMA_MATTE_CORRUPTION'
  | 'DIMENSION_MISMATCH'
  | 'ALPHA_SPILL_DEFECT'
  | 'CORRUPTED_CONTAINER';

export interface AlphaMatteMetrics {
  alphaGreenSpill99th: number; // Max allowable: < 12.0
  internalHoleBps: number;      // Max allowable: <= 200 bps (2.0%)
  boundingBoxWidth: number;
  boundingBoxHeight: number;
}

export interface CharacterPlateValidationInput {
  shotId: string;
  characterId: string;
  filePath: string;
  expectedWidth?: number;  // Default 1920
  expectedHeight?: number; // Default 1080
  mockBuffer?: Buffer;     // For offline unit testing without external disk dependencies
  mockMetrics?: Partial<AlphaMatteMetrics>;
}

export interface PlateValidationResult {
  valid: boolean;
  shotId: string;
  filePath: string;
  sha256: string;
  bytesCount: number;
  width: number;
  height: number;
  metrics?: AlphaMatteMetrics;
  rejectionClass?: PlateRejectionClass;
  error?: string;
}

export interface PinnedTrees {
  characters_tree_sha: string;
  environments_tree_sha: string;
  props_tree_sha: string;
}

export interface AssetManifest {
  manifest_version: string;
  series_slug: string;
  pinned_trees: PinnedTrees;
}

export default interface Asset extends Model {
  idx: string;
  seriesSlug: string;
  manifestVersion: string;
  isParityVerified: boolean;
  totalPlatesValidated: number;
  lastValidationResult: PlateValidationResult | null;
  liveTrees: PinnedTrees | null;
}
