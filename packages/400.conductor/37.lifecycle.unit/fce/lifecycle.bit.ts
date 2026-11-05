import {
    CharacterSomaticProfile,
    PreflightReport,
} from './lifecycle.interface.js'
import { AcousticClockReport } from './acousticClock.interface.js'
import {
    LatticeAllocationResult,
    SawtoothWasteReport,
} from './lattice.interface.js'

export default interface LifecycleBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        sceneId?: string
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
    }
    slv?: Function
}
