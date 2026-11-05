import { Model } from '../../99.core/interface/model.interface.js';

export interface SomaticMask {
  availableArms: number;
  bannedKineticVerbs: string[];
  motorLimitations?: string[];
}

export interface CharacterConstraints {
  refusalVectors: string[];
  somaticMask: SomaticMask;
}

export interface DramaticParameterVector {
  curtness: number;           // C in [0.0, 1.0]
  pacing: number;             // P in [0.0, 1.0]
  threat: number;             // T in [0.0, 1.0]
  subtextSuppression: number; // S in [0.0, 1.0]
}

export interface SceneContextPayload {
  seriesSlug: string;
  actorA: { id: string; constraints: CharacterConstraints };
  actorB: { id: string; constraints: CharacterConstraints };
  worldAxioms: string[];
  slidingProseBuffer: string; // Preceding 800-1,200 words of manuscript prose
  surfaceDispute: string;
  theUnderneathSecret: string;
  dramaticParameters: DramaticParameterVector;
  unforcedCollisionPremise: string;
  stage0ACollisionMode?: boolean;
  hardPhysicalExitTrigger?: string;
  logisticalInventory?: Record<string, string[]>;
  omittedTopicIds?: string[];
  bannedTokens?: string[];
}

export interface TokenBudgetEstimates {
  primacyTokens: number;
  contextTokens: number;
  recencyTokens: number;
  totalTokens: number;
}

export interface TopologyPercentages {
  primacyPct: number;
  contextPct: number;
  recencyPct: number;
}

export interface CompiledAttentionSandwich {
  top15Primacy: string;
  middle70Context: string;
  bottom15Recency: string;
  fullSerializedPrompt: string;
  tokenBudgetEstimates: TokenBudgetEstimates;
  topologyPercentages: TopologyPercentages;
}

export interface MruBeatNode {
  beatId: string;
  characterId: string;
  motivationStimulus: string;
  visceralReaction: string;
  calculatedAction: string;
  dialogueText: string;
  prerollFrames: number;
}

export default interface AstState extends Model {
  idx: string;
  status: string;
  lastCompiledPrompt: string | null;
  lastSandwich: CompiledAttentionSandwich | null;
  lastActionTimestamp: number;
}
