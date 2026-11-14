export interface AudioSpecification {
    sample_rate_hz: 48000
    bit_depth: 24
    channels: 1 | 2
    codec: 'pcm_s24le'
}

export interface StemProbeRequest {
    shot_id: string
    wav_path: string
    expected_sha256?: string
    mock_duration_ms?: number
}

export interface StemProbeResult {
    ok: boolean
    shot_id: string
    wav_path: string
    duration_ms: number
    sample_count: number
    file_size_bytes: number
    sha256: string
    audio_spec: AudioSpecification
    error?: string
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
    from_timecode?: string
    to_timecode?: string
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

export interface TimelineShotInput {
    shot_id: string
    duration_ms: number
}

export interface TiledShot {
    shot_id: string
    duration_ms: number
    padded_duration_ms: number
    from_frame: number
    to_frame: number
    frame_count: number
    tail_slack_ms: number
}

export interface TimelineTilingResult {
    ok: boolean
    shots: TiledShot[]
    total_duration_ms: number
    total_frames: number
    drift_ms: number
    contiguous: boolean
    error?: string
}

export type CadenceMode = 'CONFIG_A_12FPS' | 'CONFIG_B_24FPS' | 'CONFIG_C_16FPS'

export interface CadenceConfig {
    cadenceMode: CadenceMode
    nativeFps: number
}

export interface LatticeAllocation {
    shot_id: string
    target_delivery_frames: number
    native_fps: number
    raw_native_frames: number
    conformed_diffusion_frames: number
    tail_slack_frames: number
    lattice_index_n: number
    temporal_efficiency_pct: number
    conforms_to_4n_plus_1: boolean
    cadence_mode: CadenceMode
}

export interface ShotLatticeRequest {
    shot_id: string
    target_frames: number
    cadence_config?: CadenceConfig
}

export interface LatticeConformanceResult {
    ok: boolean
    allocations: LatticeAllocation[]
    total_delivery_frames: number
    total_diffusion_frames: number
    total_tail_slack_frames: number
    mean_efficiency_pct: number
    error?: string
}

export default interface Frame {
    idx: string
    totalQuantizedShots: number
    lastTimelineReceipt?: TimelineQuantizationReceipt
}
