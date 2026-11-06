// packages/400.conductor/32.audio.unit/audio.model.ts
import Audio, {
    ExposureSheetDocument,
    ExposureSheetReceipt,
} from './fce/audio.interface.js'

export class AudioModel implements Audio {
    idx: string = '32.audio'
    isAssembling: boolean = false
    lastExposureSheet?: ExposureSheetDocument
    lastReceipt?: ExposureSheetReceipt
}
