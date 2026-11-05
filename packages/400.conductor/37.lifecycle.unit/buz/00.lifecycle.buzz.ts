import { LifecycleModel } from '../lifecycle.model.js';
import LifecycleBit from '../fce/lifecycle.bit.js';
import State from '../../99.core/state.js';
import { verifyLocalContinuity } from './preflightContinuity.buzz.js';
import { evaluateSomaticCapability } from './somaticCapability.buzz.js';
import { verifyCanonMerkleLock } from './canonLock.buzz.js';
import { computeCumulativeTimeline } from './frameQuantizer.buzz.js';
import { conformToDiffusionLattice } from './latticeExpansion.buzz.js';
import { mintProvenanceManifest } from './lockfileMinting.buzz.js';
import { emitWormSnapshots } from './wormSnapshot.buzz.js';
import { dispatchSettlementReceipt } from './settlementDispatch.buzz.js';
import { chainMasterSceneLifecycle } from './chainLifecycle.buzz.js';
import { PreflightReport } from '../fce/lifecycle.interface.js';
import { MasterSceneLifecycleContext } from '../fce/masterLifecycle.interface.js';

export const initLifecycle = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  _ste: State
) => {
  cpy.stage = 'IDLE';
  cpy.lastActionTimestamp = Date.now();
  if (bal.slv) bal.slv({ lifecycleBit: { idx: 'init-lifecycle', val: 1 } });
  return cpy;
};

export const updateLifecycle = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  _ste: State
) => {
  cpy.lastActionTimestamp = Date.now();
  if (bal.slv) bal.slv({ lifecycleBit: { idx: 'update-lifecycle', val: 1 } });
  return cpy;
};

export const runInceptionPreflight = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  _ste: State
) => {
  const sceneId = bal.dat?.sceneId || bal.src || 'NONE';
  cpy.activeSceneId = sceneId;
  cpy.stage = 'STAGE_1_INCEPTION_PREFLIGHT';

  const continuity = await verifyLocalContinuity(sceneId, bal.dat?.sqliteDb);
  const somatic = evaluateSomaticCapability(
    bal.dat?.cast || [],
    bal.dat?.requiredVerbs || {}
  );
  const canonLock = bal.dat?.canonState && bal.dat?.expectedMerkleRoot
    ? verifyCanonMerkleLock(bal.dat.canonState, bal.dat.expectedMerkleRoot)
    : { valid: true, calculatedMerkleRoot: 'BYPASS', expectedMerkleRoot: 'BYPASS', diverged: false };

  const isOk = continuity.clean && somatic.valid && canonLock.valid;
  cpy.stage = isOk ? 'PASSED_PREFLIGHT' : 'STAGE_FAILED_DIRTY';

  const report: PreflightReport = {
    ok: isOk,
    sceneId,
    continuity,
    somatic,
    canonLock,
    evaluatedAtMs: Date.now(),
    t0Spend: '$0.00',
  };

  cpy.lastReport = report;
  cpy.lastActionTimestamp = Date.now();

  if (bal.slv) {
    bal.slv({
      lifecycleBit: {
        idx: 'run-inception-preflight',
        val: isOk ? 1 : 0,
        src: isOk ? 'PREFLIGHT_PASSED' : 'PREFLIGHT_BLOCKED',
        dat: { report },
      },
    });
  }

  return cpy;
};

export const quantizeAcousticClockBuzz = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  _ste: State
) => {
  const sceneId = bal.dat?.sceneId || bal.src || cpy.activeSceneId || 'ep01_sc01';
  const durations = bal.dat?.stemDurationsMs || [];

  const timeline = computeCumulativeTimeline(durations);
  cpy.lastActionTimestamp = Date.now();

  process.stdout.write(
    `>> [ACOUSTIC-CLOCK] [OK] Quantized ${durations.length} stems into ${timeline.totalFrames} discrete frames ($T_0 = $0.00).\n`
  );

  if (bal.slv) {
    bal.slv({
      lifecycleBit: {
        idx: 'quantize-acoustic-clock',
        val: 1,
        src: 'QUANTIZED',
        dat: { sceneId, timeline },
      },
    });
  }

  return cpy;
};

export const conformDiffusionLatticeBuzz = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  _ste: State
) => {
  const targetFrames = bal.dat?.targetFrames || 0;
  const latticeAllocation = conformToDiffusionLattice(targetFrames);
  cpy.lastActionTimestamp = Date.now();

  process.stdout.write(
    `>> [LATTICE] [OK] Conformed ${targetFrames} master frames -> ${latticeAllocation.conformedDiffusionFrames} diffusion frames.\n`
  );

  if (bal.slv) {
    bal.slv({
      lifecycleBit: {
        idx: 'conform-diffusion-lattice',
        val: 1,
        src: 'LATTICE_CONFORMED',
        dat: { latticeAllocation },
      },
    });
  }

  return cpy;
};

export const sealProvenanceLedgerBuzz = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  _ste: State
) => {
  const sceneId = bal.dat?.sceneId || bal.src || cpy.activeSceneId || 'ep01_sc01';
  const episodeId = bal.dat?.episodeId || 'ep01';
  const assetPaths = bal.dat?.assetPaths || [];

  const manifest = await mintProvenanceManifest(sceneId, episodeId, assetPaths);
  const wormReceipt = await emitWormSnapshots(sceneId, manifest);
  const settlementReceipt = await dispatchSettlementReceipt(manifest);

  cpy.lastProvenanceManifest = manifest;
  cpy.lastSettlementReceipt = settlementReceipt;
  cpy.stage = settlementReceipt.ok ? 'PASSED_PREFLIGHT' : 'STAGE_FAILED_DIRTY';
  cpy.lastActionTimestamp = Date.now();

  if (bal.slv) {
    bal.slv({
      lifecycleBit: {
        idx: 'seal-provenance-ledger',
        val: settlementReceipt.ok && wormReceipt.ok ? 1 : 0,
        src: manifest.lockfileSha256 || 'SEALED',
        dat: { manifest, wormReceipt, settlementReceipt },
      },
    });
  }

  return cpy;
};

export const chainMasterSceneLifecycleBuzz = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  ste: State
) => {
  const initialContext: MasterSceneLifecycleContext = bal.dat?.lifecycleContext || {
    sceneId: bal.src || 'ep01_sc01',
    episodeId: 'ep01',
    currentStage: 'STAGE_0_IDLE',
    isDirty: false,
    shots: [
      {
        shotId: 'sh01',
        speakerId: 'char_elias',
        dialogueText: 'The pressure needle is shivering.',
        durationMs: 3125,
      },
      {
        shotId: 'sh02',
        speakerId: 'char_torvin',
        dialogueText: 'Hold the gasket.',
        durationMs: 2000,
      },
    ],
    totalFrames: 0,
    activeLeaseId: null,
    activeEpoch: null,
    stampedTsxPath: null,
    outputDeliverablePath: null,
    lockfileSha256: null,
    vramUsedMb: 0,
    t4Spend: '$0.00',
    attemptCount: 0,
    maxAttempts: 3,
    telemetryLogs: [],
  };

  try {
    const finalContext = await chainMasterSceneLifecycle(initialContext, ste);
    cpy.lastLifecycleContext = finalContext;
    cpy.stage = 'PASSED_PREFLIGHT';
    cpy.lastActionTimestamp = Date.now();

    if (bal.slv) {
      bal.slv({
        lifecycleBit: {
          idx: 'chain-master-scene-lifecycle',
          val: 1,
          src: finalContext.currentStage,
          dat: { lifecycleContext: finalContext },
        },
      });
    }
  } catch (err: any) {
    cpy.stage = 'STAGE_FAILED_DIRTY';
    cpy.lastActionTimestamp = Date.now();

    if (bal.slv) {
      bal.slv({
        lifecycleBit: {
          idx: 'chain-master-scene-lifecycle-error',
          val: 0,
          src: err.message,
          dat: { lifecycleContext: initialContext },
        },
      });
    }
  }

  return cpy;
};
