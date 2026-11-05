import { LifecycleModel } from '../lifecycle.model.js'
import LifecycleBit from '../fce/lifecycle.bit.js'
import State from '../../99.core/state.js'
import { verifyLocalContinuity } from './preflightContinuity.buzz.js'
import { evaluateSomaticCapability } from './somaticCapability.buzz.js'
import { verifyCanonMerkleLock } from './canonLock.buzz.js'
import { computeCumulativeTimeline } from './frameQuantizer.buzz.js'
import { calculateMultiWindowDuckingCurve } from './audioDucking.buzz.js'
import { conformToDiffusionLattice } from './latticeExpansion.buzz.js'
import { mintProvenanceManifest } from './lockfileMinting.buzz.js'
import { emitWormSnapshots } from './wormSnapshot.buzz.js'
import { dispatchSettlementReceipt } from './settlementDispatch.buzz.js'
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

    const continuity = await verifyLocalContinuity(sceneId, bal.dat?.sqliteDb)
    const somatic = evaluateSomaticCapability(
        bal.dat?.cast || [],
        bal.dat?.requiredVerbs || {},
    )
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
    cpy.stage = isOk ? 'PASSED_PREFLIGHT' : 'STAGE_FAILED_DIRTY'

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

export const quantizeAcousticClockBuzz = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    _ste: State,
) => {
    const sceneId =
        bal.dat?.sceneId || bal.src || cpy.activeSceneId || 'ep01_sc01'
    const durations = bal.dat?.stemDurationsMs || []

    const timeline = computeCumulativeTimeline(durations)
    cpy.lastActionTimestamp = Date.now()

    process.stdout.write(
        `>> [ACOUSTIC-CLOCK] [OK] Quantized ${durations.length} stems into ${timeline.totalFrames} discrete frames ($T_0 = $0.00).\n`,
    )

    if (bal.slv) {
        bal.slv({
            lifecycleBit: {
                idx: 'quantize-acoustic-clock',
                val: 1,
                src: 'QUANTIZED',
                dat: { sceneId, timeline },
            },
        })
    }

    return cpy
}

export const conformDiffusionLatticeBuzz = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    _ste: State,
) => {
    const targetFrames = bal.dat?.targetFrames || 0
    const latticeAllocation = conformToDiffusionLattice(targetFrames)
    cpy.lastActionTimestamp = Date.now()

    process.stdout.write(
        `>> [LATTICE] [OK] Conformed ${targetFrames} master frames -> ${latticeAllocation.conformedDiffusionFrames} diffusion frames (n=${latticeAllocation.latticeIndexN}, slack=${latticeAllocation.paddingFrames}f).\n`,
    )

    if (bal.slv) {
        bal.slv({
            lifecycleBit: {
                idx: 'conform-diffusion-lattice',
                val: 1,
                src: 'LATTICE_CONFORMED',
                dat: { latticeAllocation },
            },
        })
    }

    return cpy
}

export const sealProvenanceLedgerBuzz = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    _ste: State,
) => {
    const sceneId =
        bal.dat?.sceneId || bal.src || cpy.activeSceneId || 'ep01_sc01'
    const episodeId = bal.dat?.episodeId || 'ep01'
    const assetPaths = bal.dat?.assetPaths || []

    // 1. Mint Universal Provenance Manifest & compute lockfileSha256
    const manifest = await mintProvenanceManifest(
        sceneId,
        episodeId,
        assetPaths,
    )

    // 2. Emit Dual WORM Snapshots
    const wormReceipt = await emitWormSnapshots(sceneId, manifest)

    // 3. Dispatch Relational Settlement to Edge
    const settlementReceipt = await dispatchSettlementReceipt(manifest)

    cpy.lastProvenanceManifest = manifest
    cpy.lastSettlementReceipt = settlementReceipt
    cpy.stage = settlementReceipt.ok ? 'PASSED_PREFLIGHT' : 'STAGE_FAILED_DIRTY'
    cpy.lastActionTimestamp = Date.now()

    if (bal.slv) {
        bal.slv({
            lifecycleBit: {
                idx: 'seal-provenance-ledger',
                val: settlementReceipt.ok && wormReceipt.ok ? 1 : 0,
                src: manifest.lockfileSha256 || 'SEALED',
                dat: { manifest, wormReceipt, settlementReceipt },
            },
        })
    }

    return cpy
}
