import {
    RawStemDuration,
    QuantizedShot,
    TimelineQuantizationReceipt,
    StemProbeRequest,
    StemProbeResult,
    TimelineShotInput,
    TimelineTilingResult,
    ShotLatticeRequest,
    LatticeConformanceResult,
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
        tilingRequest?: TimelineShotInput[]
        tilingResult?: TimelineTilingResult
        latticeRequest?: ShotLatticeRequest[]
        latticeResult?: LatticeConformanceResult
    }
    slv?: Function
}
