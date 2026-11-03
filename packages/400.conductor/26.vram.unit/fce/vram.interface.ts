import { Model } from '../../99.core/interface/model.interface.js'

export interface VramSample {
    freeMb: number
    totalMb: number
    usedMb: number
}

export interface VramHygieneResult {
    verified: boolean
    baselineFreeMb: number
    finalFreeMb: number
    toleranceMb: number
    durationMs: number
    error?: string
}

export default interface Vram extends Model {
    endpointUrl: string
    baselineFreeMb: number
    toleranceMb: number
    totalFlushesExecuted: number
    lastHygieneResult: VramHygieneResult | null
}
