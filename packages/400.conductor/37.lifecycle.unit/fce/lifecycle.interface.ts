import { Model } from '../../99.core/interface/model.interface.js'

export type LifecycleStage =
    | 'IDLE'
    | 'STAGE_1_INCEPTION_PREFLIGHT'
    | 'STAGE_FAILED_DIRTY'
    | 'STAGE_FAILED_SOMATIC'
    | 'STAGE_FAILED_CANON_DRIFT'
    | 'PASSED_PREFLIGHT'
    | 'STAGE_PROVENANCE_SEALED'

export interface CharacterSomaticProfile {
    characterId: string
    functionalLimbs: number
    bannedKineticVerbs: string[]
}

export interface ContinuityCheckResult {
    clean: boolean
    sceneId: string
    dirtyCount: number
    totalDependencies: number
    latencyMs: number
    reason?: string
}

export interface SomaticCheckResult {
    valid: boolean
    violatingCharacters: string[]
    reasons: string[]
}

export interface CanonLockResult {
    valid: boolean
    calculatedMerkleRoot: string
    expectedMerkleRoot: string
    diverged: boolean
}

export interface PreflightReport {
    ok: boolean
    sceneId: string
    continuity: ContinuityCheckResult
    somatic: SomaticCheckResult
    canonLock: CanonLockResult
    evaluatedAtMs: number
    t0Spend: '$0.00'
}

export default interface Lifecycle extends Model {
    idx: string
    activeSceneId: string
    stage: LifecycleStage
    lastReport: PreflightReport | null
    lastActionTimestamp: number
}
