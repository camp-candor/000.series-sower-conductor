export interface AudioSpecification {
  sample_rate_hz: 48000;
  bit_depth: 24;
  channels: 1 | 2;
  codec: 'pcm_s24le';
}

export interface StemProbeRequest {
  shot_id: string;
  wav_path: string;
  expected_sha256?: string;
  mock_duration_ms?: number;
}

export interface StemProbeResult {
  ok: boolean;
  shot_id: string;
  wav_path: string;
  duration_ms: number;
  sample_count: number;
  file_size_bytes: number;
  sha256: string;
  audio_spec: AudioSpecification;
  error?: string;
}

export interface RawStemDuration {
    shot_id: string
    duration_ms: number
    sample_count?: number
}

export interface CausalVaeAllocation {
    raw_frames: number
    conformed_frames: number
    padding_slack_frames: number
    n_stride: number
}

export interface QuantizedShot {
    shot_id: string
    duration_ms: number
    target_frames: number
    from_frame: number
    to_frame: number
    sample_offset_start: number
    sample_offset_end: number
    causal_vae: CausalVaeAllocation
}

export interface TimelineQuantizationReceipt {
    ok: boolean
    total_shots: number
    total_duration_ms: number
    total_frames: number
    drift_ms: number
    is_contiguous: boolean
    shots: QuantizedShot[]
    error?: string
}

export type QuantizedFrameBudget = TimelineQuantizationReceipt

export default interface Frame {
    idx: string
    totalQuantizedShots: number
    lastTimelineReceipt?: TimelineQuantizationReceipt
}
