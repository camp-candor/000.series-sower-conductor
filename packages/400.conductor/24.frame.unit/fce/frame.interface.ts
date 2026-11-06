export interface RawStemDuration {
  shot_id: string;
  duration_ms: number;
  sample_count?: number;
}

export interface CausalVaeAllocation {
  raw_frames: number;
  conformed_frames: number;
  padding_slack_frames: number;
  n_stride: number;
}

export interface QuantizedShot {
  shot_id: string;
  duration_ms: number;
  target_frames: number;
  from_frame: number;
  to_frame: number;
  sample_offset_start: number;
  sample_offset_end: number;
  causal_vae: CausalVaeAllocation;
}

export interface TimelineQuantizationReceipt {
  ok: boolean;
  total_shots: number;
  total_duration_ms: number;
  total_frames: number;
  drift_ms: number;
  is_contiguous: boolean;
  shots: QuantizedShot[];
  error?: string;
}

export default interface Frame {
  idx: string;
  totalQuantizedShots: number;
  lastTimelineReceipt?: TimelineQuantizationReceipt;
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
