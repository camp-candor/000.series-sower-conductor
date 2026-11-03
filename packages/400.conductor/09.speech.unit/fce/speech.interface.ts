import { Model } from '../../99.core/interface/model.interface.js'

export interface TTSDspModifiers {
    basePitchShiftSemitones?: number
    formantWarpingFactor?: number
    breathinessPauseMultiplier?: number
    vocalFryDensity?: number
    pause_frequency_multiplier?: number
}

export interface TTSGenerationRequest {
    character: string
    text: string
    emotion: string
    tonePacing: number
    dsp_modifiers: TTSDspModifiers
}

export interface AudioStemResult {
    lineId: string
    speakerId: string
    filePath: string
    durationMs: number
    sha256: string
}

export interface SceneSynthesisResult {
    sceneId: string
    totalLines: number
    stems: AudioStemResult[]
    completedAtMs: number
}

export default interface Speech extends Model {
    endpointUrl: string
    scratchOutputDir: string
    totalStemsSynthesized: number
    lastSceneResult: SceneSynthesisResult | null
}
