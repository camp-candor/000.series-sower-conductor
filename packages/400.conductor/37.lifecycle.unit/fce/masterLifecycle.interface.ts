export type MasterSceneStage =
  | 'STAGE_0_IDLE'
  | 'STAGE_1_INCEPTION_PREFLIGHT'
  | 'STAGE_2_AST_VERBATIM_LOCK'
  | 'STAGE_3_ACOUSTIC_QUANTIZATION'
  | 'STAGE_4_MODEL_CONFORMANCE'
  | 'STAGE_5_HARDWARE_MUTEX_ACQUIRED'
  | 'STAGE_6_METAPROGRAM_STAMPED'
  | 'STAGE_7_OPTICAL_PRINTED'
  | 'STAGE_8_PROVENANCE_SEALED'
  | 'STAGE_FAILED_DLQ'
  | 'STAGE_ESCALATED_HUMAN_REVIEW';

export interface ShotLifecycleItem {
  shotId: string;
  speakerId: string;
  dialogueText: string;
  durationMs: number;
  frameBudget?: number;
  audioWavPath?: string;
  videoPlatePath?: string;
  bgMattePath?: string;
}

export interface MasterSceneLifecycleContext {
  sceneId: string;
  episodeId: string;
  currentStage: MasterSceneStage;
  isDirty: boolean;
  shots: ShotLifecycleItem[];
  totalFrames: number;
  activeLeaseId: string | null;
  activeEpoch: number | null;
  stampedTsxPath: string | null;
  outputDeliverablePath: string | null;
  lockfileSha256: string | null;
  vramUsedMb: 0;
  t0Spend: '$0.00';
  t4Spend: '$0.00';
  attemptCount: number;
  maxAttempts: number;
  telemetryLogs: string[];
  lastError?: string;
}

export interface MeuRepairDecision {
  sceneId: string;
  action: 'INFILL' | 'ESCALATE';
  repairSpanRatio: number;
  affectedBeats: number;
  totalBeats: number;
  reason: string;
  shouldHalt: boolean;
}

export interface CircuitBreakerResult {
  quarantined: boolean;
  action: 'RETRY' | 'DEAD_LETTER_QUARANTINE';
  currentAttempt: number;
  maxAttempts: number;
  error: string;
}

export default interface Lifecycle {
  idx: string;
  activeSceneId: string;
  stage: MasterSceneStage;
  lastMasterContext: MasterSceneLifecycleContext | null;
  lastActionTimestamp: number;
}
