import { AcousticDspModifiers } from '../../10.somaticdsp.unit/fce/somaticdsp.interface.js'

export type TtsEngineType = 'styletts2' | 'parler' | 'piper'

export interface DialogueSynthesisItem {
    line_id: string
    speaker_id: string
    dialogue_text: string
    emotion_tag: string
    tonePacing?: number
    dsp_modifiers?: AcousticDspModifiers
    output_filename?: string
}

export interface SpeechGenerationRequest {
    series_id: string
    scene_id: string
    engine: TtsEngineType
    items: DialogueSynthesisItem[]
    output_directory?: string
}

export interface StemSynthesisReceipt {
    ok: boolean
    line_id: string
    speaker_id: string
    target_path: string
    byte_size: number
    sha256: string
    duration_ms: number
    execution_ms: number
    attempts: number
    error?: string
}

export interface SceneSpeechReceipt {
    ok: boolean
    scene_id: string
    total_lines: number
    successful_stems: number
    failed_stems: number
    stems: StemSynthesisReceipt[]
    error?: string
}

export default interface Speech {
    idx: string
    isProcessing: boolean
    totalStemsSynthesized: number
    lastSceneReceipt?: SceneSpeechReceipt
}
