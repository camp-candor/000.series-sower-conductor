import {
    CharacterSomaticProfile,
    PreflightReport,
} from './lifecycle.interface.js'

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
    }
    slv?: Function
}
