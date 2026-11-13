// packages/400.conductor/32.audio.unit/audio.model.ts
import type Audio from './fce/audio.interface.js'
import type { MultiTrackAudioPlan } from './fce/audio.interface.js'
import type {
    ExposureSheetDocument,
    ExposureSheetReceipt,
} from './fce/audio.interface.js'

export class AudioModel implements Audio {
    idx = '32.audio'
    isAssembling: boolean = false
    lastExposureSheet?: ExposureSheetDocument
    lastReceipt?: ExposureSheetReceipt
    lastPlan?: MultiTrackAudioPlan
}
