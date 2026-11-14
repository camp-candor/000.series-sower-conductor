// packages/400.conductor/32.audio.unit/fce/audio.bit.ts
import type {
    DialogueWindow,
    SilenceWindow,
    MultiTrackAudioPlan,
    FoleyCueItem,
    ExposureSheetChronology,
    ExposureSheetDocument,
    ExposureSheetReceipt,
} from './audio.interface.js'

export default interface AudioBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        scene_id?: string
        series_id?: string
        ambient_loop_path?: string
        dialogue_windows?: DialogueWindow[]
        dialogueWindows?: DialogueWindow[]
        silenceWindows?: SilenceWindow[]
        foley_cues?: FoleyCueItem[]
        exposureSheet?: ExposureSheetDocument
        receipt?: ExposureSheetReceipt
        totalFrames?: number
        baseVolume?: number
        attenuationDb?: number
        foleyRequests?: {
            sceneId: string
            shotId: string
            cueName: string
            frameOffset: number
            availableSamples: string[]
        }[]
        foleyCues?: FoleyCueItem[]
        audioPlan?: MultiTrackAudioPlan
        chronology?: ExposureSheetChronology
    }
    slv?: (result: { audBit: Partial<AudioBit> }) => void
}
