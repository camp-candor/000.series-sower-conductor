import {
    CharacterSomaticProfile,
    PreflightReport,
} from './lifecycle.interface.js'
import { AcousticClockReport } from './acousticClock.interface.js'
import {
    LatticeAllocationResult,
    SawtoothWasteReport,
} from './lattice.interface.js'
import {
    UniversalProvenanceManifest,
    WormEmissionReceipt,
    SettlementDispatchReceipt,
} from './provenance.interface.js'

export default interface LifecycleBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        sceneId?: string
        episodeId?: string
        sqliteDb?: any
        cast?: CharacterSomaticProfile[]
        requiredVerbs?: Record<string, string[]>
        canonState?: unknown
        expectedMerkleRoot?: string
        report?: PreflightReport
        stemDurationsMs?: number[]
        dialogueIntervals?: [number, number][]
        totalFrames?: number
        clockReport?: AcousticClockReport
        targetFrames?: number
        latticeAllocation?: LatticeAllocationResult
        wasteReport?: SawtoothWasteReport
        assetPaths?: string[]
        provenanceManifest?: UniversalProvenanceManifest
        wormReceipt?: WormEmissionReceipt
        settlementReceipt?: SettlementDispatchReceipt
        [key: string]: any
    }
    slv?: Function
}
