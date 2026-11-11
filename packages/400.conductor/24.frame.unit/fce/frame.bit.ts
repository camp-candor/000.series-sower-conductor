import {
    RawStemDuration,
    QuantizedShot,
    TimelineQuantizationReceipt,
    StemProbeRequest,
    StemProbeResult,
} from './frame.interface.js'

export default interface FrameBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        stems?: RawStemDuration[]
        singleStem?: RawStemDuration
        wavPath?: string
        receipt?: TimelineQuantizationReceipt
        quantizedShot?: QuantizedShot
        probeRequest?: StemProbeRequest
        probeResult?: StemProbeResult
        mockDurationMs?: number
    }
    slv?: Function
}
