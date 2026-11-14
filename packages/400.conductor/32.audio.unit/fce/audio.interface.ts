// packages/400.conductor/32.audio.unit/fce/audio.interface.ts
export interface DialogueWindow {
    shot_id: string
    from_frame: number
    to_frame: number
    stem_path?: string
    speaker_id?: string
}

export interface SilenceWindow {
    from_frame: number
    to_frame: number
    duck_ambient_db: number
}

export interface DuckingGainNode {
    frame: number
    gain: number
}

export interface FoleyCueItem {
    shot_id: string
    frame_offset: number
    cue_name: string
    resolved_sample: string
    volume: number
}

export interface MultiTrackAudioPlan {
    total_frames: number
    base_volume: number
    attenuation_db: number
    dialogue_windows: DialogueWindow[]
    silence_windows: SilenceWindow[]
    gain_curve: DuckingGainNode[]
    foley_cues: FoleyCueItem[]
}

export interface ExposureSheetShotTrack {
    shot_id: string
    from_frame: number
    to_frame: number
    target_frames: number
    dialogue_stem: string
    dialogue_sha256: string
    foley_events: FoleyCueItem[]
}

export interface ExposureSheetChronology {
    start_date: string
    start_time_hm: string
    start_timecode_smpte: string
    end_timecode_smpte: string
    daypart: 'DAWN' | 'MORNING' | 'AFTERNOON' | 'DUSK' | 'NIGHT'
}

export interface ExposureSheetDocument {
    schema_version: string
    series_id: string
    scene_id: string
    total_frames: number
    total_duration_ms: number
    chronology?: ExposureSheetChronology
    tracks: {
        track1_dialogue: ExposureSheetShotTrack[]
        track2_foley: FoleyCueItem[]
        track3_ambient: {
            ambient_loop_path: string
            base_volume: number
            ducked_volume: number
            ducking_keyframes: DuckingGainNode[]
        }
    }
}

export interface ExposureSheetReceipt {
    ok: boolean
    scene_id: string
    total_frames: number
    manifest_path: string
    ducking_point_count: number
    foley_event_count: number
    sha256: string
    error?: string
}

export default interface Audio {
    idx: string
    isAssembling?: boolean
    lastExposureSheet?: ExposureSheetDocument
    lastReceipt?: ExposureSheetReceipt
    lastPlan?: MultiTrackAudioPlan
}
