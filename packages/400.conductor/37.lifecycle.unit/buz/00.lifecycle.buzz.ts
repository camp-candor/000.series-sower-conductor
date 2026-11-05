import { LifecycleModel } from '../lifecycle.model.js'
import LifecycleBit from '../fce/lifecycle.bit.js'
import State from '../../99.core/state.js'
import { verifyLocalContinuity } from './preflightContinuity.buzz.js'
import { evaluateSomaticCapability } from './somaticCapability.buzz.js'
import { verifyCanonMerkleLock } from './canonLock.buzz.js'
import { PreflightReport } from '../fce/lifecycle.interface.js'

export const initLifecycle = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    _ste: State,
) => {
    cpy.stage = 'IDLE'
    cpy.lastActionTimestamp = Date.now()
    if (bal.slv) bal.slv({ lifecycleBit: { idx: 'init-lifecycle', val: 1 } })
    return cpy
}

export const updateLifecycle = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    _ste: State,
) => {
    cpy.lastActionTimestamp = Date.now()
    if (bal.slv) bal.slv({ lifecycleBit: { idx: 'update-lifecycle', val: 1 } })
    return cpy
}

export const runInceptionPreflight = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    _ste: State,
) => {
    const sceneId = bal.dat?.sceneId || bal.src || 'NONE'
    cpy.activeSceneId = sceneId
    cpy.stage = 'STAGE_1_INCEPTION_PREFLIGHT'

    // 1. Relational Continuity Audit
    const continuity = await verifyLocalContinuity(sceneId, bal.dat?.sqliteDb)

    // 2. Somatic SAT Capability Audit
    const somatic = evaluateSomaticCapability(
        bal.dat?.cast || [],
        bal.dat?.requiredVerbs || {},
    )

    // 3. Canon Merkle Lock Audit
    const canonLock =
        bal.dat?.canonState && bal.dat?.expectedMerkleRoot
            ? verifyCanonMerkleLock(
                  bal.dat.canonState,
                  bal.dat.expectedMerkleRoot,
              )
            : {
                  valid: true,
                  calculatedMerkleRoot: 'BYPASS',
                  expectedMerkleRoot: 'BYPASS',
                  diverged: false,
              }

    const isOk = continuity.clean && somatic.valid && canonLock.valid

    if (!continuity.clean) {
        cpy.stage = 'STAGE_FAILED_DIRTY'
    } else if (!somatic.valid) {
        cpy.stage = 'STAGE_FAILED_SOMATIC'
    } else if (!canonLock.valid) {
        cpy.stage = 'STAGE_FAILED_CANON_DRIFT'
    } else {
        cpy.stage = 'PASSED_PREFLIGHT'
    }

    const report: PreflightReport = {
        ok: isOk,
        sceneId,
        continuity,
        somatic,
        canonLock,
        evaluatedAtMs: Date.now(),
        t0Spend: '$0.00',
    }

    cpy.lastReport = report
    cpy.lastActionTimestamp = Date.now()

    if (bal.slv) {
        bal.slv({
            lifecycleBit: {
                idx: 'run-inception-preflight',
                val: isOk ? 1 : 0,
                src: isOk ? 'PREFLIGHT_PASSED' : 'PREFLIGHT_BLOCKED',
                dat: { report },
            },
        })
    }

    return cpy
}
