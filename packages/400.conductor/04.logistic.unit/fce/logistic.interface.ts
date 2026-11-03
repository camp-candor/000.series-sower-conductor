import { Model } from '../../99.core/interface/model.interface.js';

export type WorkflowTemplate =
  | 'wan_greenscreen_i2v.json'
  | 'flux_matte_background.json'
  | 'inpaint_repair.json';

export interface SpokePayloadDetails {
  sceneId: string;
  shotId: string;
  prompt: string;
  negativePrompt: string;
  loraTag: string;
  loraSha256: string;
  canonMerkleRoot: string;
  targetPromptNodeId: string;
  targetFrameNodeId: string;
  targetSeedNodeId: string;
  diffusionAllocation: number; // 4n + 1 frames
  masterDeliveryFrames: number; // 24fps frame count
  seed: number;
}

export interface SpokeExecutionPayload {
  type: 'ENQUEUE_SHOT';
  jobId: string;
  artistId: string;
  idempotencyKey: string;
  workflowTemplate: WorkflowTemplate;
  payload: SpokePayloadDetails;
}

export interface LeaseRecord {
  taskId: string;
  epoch: number;
  fencingToken: number;
  dispatchedAtMs: number;
  expiresAtMs: number;
}

export interface DispatchReceipt {
  jobId: string;
  idempotencyKey: string;
  epoch: number;
  status: 'PENDING' | 'DISPATCHED' | 'HEARTBEAT_ACTIVE' | 'ABORTED' | 'COMPLETED';
  assetR2Url?: string;
  error?: string;
}

export default interface Logistic extends Model {
  idx: string;
  edgeCoordinatorUrl: string;
  currentLeaseEpoch: number;
  totalDispatchesExecuted: number;
  activeDispatches: Record<string, DispatchReceipt>;
}
