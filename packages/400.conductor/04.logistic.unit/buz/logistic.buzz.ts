import crypto from 'node:crypto';
import { LogisticModel } from '../logistic.model.js';
import LogisticBit from '../fce/logistic.bit.js';
import State from '../../99.core/state.js';
import {
  SpokeExecutionPayload,
  WorkflowTemplate,
  DispatchReceipt,
  LeaseRecord,
} from '../fce/logistic.interface.js';

export function buildSpokeExecutionPayload(params: {
  sceneId: string;
  shotId: string;
  artistId?: string;
  workflowTemplate?: WorkflowTemplate;
  positivePrompt: string;
  negativePrompt?: string;
  loraTag: string;
  loraSha256: string;
  canonMerkleRoot: string;
  masterDeliveryFrames: number;
  seed: number;
}): SpokeExecutionPayload {
  // Causal 3D VAE lattice rule: 4n + 1
  const n = Math.ceil((params.masterDeliveryFrames - 1) / 4);
  const diffusionAllocation = 4 * n + 1;

  const jobId = `job_${params.sceneId}_${params.shotId}`;
  const idempotencyKey = crypto.randomUUID();

  // Enforce studio #00FF00 chroma key prompt isolation
  const sanitizedPositive = params.positivePrompt.includes('#00FF00')
    ? params.positivePrompt
    : `${params.positivePrompt}, solid neon green background, hex #00FF00 backdrop, studio chroma key isolation`;

  const sanitizedNegative = params.negativePrompt
    ? params.negativePrompt
    : 'background clutter, real environment, photorealistic backdrop, complex background';

  return {
    type: 'ENQUEUE_SHOT',
    jobId,
    artistId: params.artistId || 'artist_rig1_conductor',
    idempotencyKey,
    workflowTemplate: params.workflowTemplate || 'wan_greenscreen_i2v.json',
    payload: {
      sceneId: params.sceneId,
      shotId: params.shotId,
      prompt: sanitizedPositive,
      negativePrompt: sanitizedNegative,
      loraTag: params.loraTag,
      loraSha256: params.loraSha256,
      canonMerkleRoot: params.canonMerkleRoot,
      targetPromptNodeId: '6',
      targetFrameNodeId: '37',
      targetSeedNodeId: '3',
      diffusionAllocation,
      masterDeliveryFrames: params.masterDeliveryFrames,
      seed: params.seed,
    },
  };
}

export async function executeSpokeDispatchWorkflow(
  payload: SpokeExecutionPayload,
  coordinatorUrl: string,
  options?: {
    customFetch?: typeof fetch;
    skipHeartbeatLoop?: boolean;
  }
): Promise<DispatchReceipt> {
  const cns = '>> [SPOKE-DISPATCH]';
  const fetchImpl = options?.customFetch || fetch;
  const baseUrl = coordinatorUrl.replace(/\/+$/, '');

  // 1. Pre-Flight Relational Continuity Audit Gate (< 5ms)
  const stalenessUrl = `${baseUrl}/staleness/${payload.payload.sceneId}`;
  const stalenessRes = await fetchImpl(stalenessUrl, { method: 'GET' });

  if (stalenessRes.status === 412) {
    const err = `DIRTY_SCENE_REJECTED: Precondition failed at T_0 = $0.00 for scene ${payload.payload.sceneId}`;
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    throw new Error(err);
  }

  if (!stalenessRes.ok && stalenessRes.status !== 404) {
    throw new Error(`COORDINATOR_PROBE_ERROR: HTTP ${stalenessRes.status} on staleness check`);
  }

  // 2. Hardware Lease Claim with Monotonic Epoch
  const leaseClaimUrl = `${baseUrl}/lease/acquire`;
  const leaseRes = await fetchImpl(leaseClaimUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobId: payload.jobId,
      artistId: payload.artistId,
      idempotencyKey: payload.idempotencyKey,
    }),
  });

  if (leaseRes.status === 409) {
    throw new Error(`ZOMBIE_LEASE_EPOCH: Execution rejected by coordinator epoch fencing (HTTP 409)`);
  }

  if (!leaseRes.ok) {
    throw new Error(`LEASE_ACQUISITION_FAILED: HTTP ${leaseRes.status}`);
  }

  const leaseData = (await leaseRes.json()) as LeaseRecord;
  const epoch = leaseData.epoch || 1;

  process.stdout.write(
    `${cns} [OK] Lease granted for ${payload.jobId} (Epoch: ${epoch}, Fencing Token: ${leaseData.fencingToken})\n`
  );

  // 3. Dispatch Job Execution Payload
  const dispatchUrl = `${baseUrl}/dispatch`;
  const dispatchRes = await fetchImpl(dispatchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Lease-Epoch': epoch.toString(),
      'X-Idempotency-Key': payload.idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (dispatchRes.status === 409) {
    throw new Error(`ZOMBIE_LEASE_EPOCH: Stale fencing token rejected during dispatch (HTTP 409)`);
  }

  if (!dispatchRes.ok) {
    throw new Error(`DISPATCH_EXECUTION_FAILED: HTTP ${dispatchRes.status}`);
  }

  // 4. Single-Turn Heartbeat Validation (if not skipped)
  if (!options?.skipHeartbeatLoop) {
    const heartbeatUrl = `${baseUrl}/lease/heartbeat`;
    const hbRes = await fetchImpl(heartbeatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: payload.jobId, epoch }),
    });

    if (hbRes.status === 409) {
      throw new Error(`ZOMBIE_LEASE_EPOCH: Heartbeat rejected due to epoch advancement (HTTP 409)`);
    }
  }

  return {
    jobId: payload.jobId,
    idempotencyKey: payload.idempotencyKey,
    epoch,
    status: 'DISPATCHED',
  };
}

export const initLogistic = (cpy: LogisticModel, bal: LogisticBit, _ste: State) => {
  if (bal.slv) bal.slv({ logisticBit: { idx: 'init-logistic', val: 1 } });
  return cpy;
};

export const compileSpokePayload = (cpy: LogisticModel, bal: LogisticBit, _ste: State) => {
  const cns = '>> [SPOKE-DISPATCH]';
  const params = bal.dat;

  if (!params || !params.sceneId || !params.shotId || !params.positivePrompt) {
    const err = 'COMPILATION_REJECTED: Missing mandatory shot parameters';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ logisticBit: { idx: 'compile-spoke-payload-error', val: 0, src: err } });
    throw new Error(err);
  }

  try {
    const payload = buildSpokeExecutionPayload(params);
    process.stdout.write(
      `${cns} [OK] Compiled SpokeExecutionPayload ${payload.jobId} (Lattice: ${payload.payload.diffusionAllocation}f @ #00FF00)\n`
    );

    if (bal.slv) {
      bal.slv({
        logisticBit: {
          idx: 'compile-spoke-payload',
          val: 1,
          src: payload.jobId,
          dat: payload,
        },
      });
    }
  } catch (err: any) {
    process.stderr.write(`${cns} [FAIL] ${err.message}\n`);
    if (bal.slv) {
      bal.slv({ logisticBit: { idx: 'compile-spoke-payload-error', val: 0, src: err.message } });
    } else {
      throw err;
    }
  }

  return cpy;
};

export const dispatchSpokePayload = async (cpy: LogisticModel, bal: LogisticBit, _ste: State) => {
  const cns = '>> [SPOKE-DISPATCH]';
  const payload = bal.dat?.payload as SpokeExecutionPayload;
  const coordinatorUrl = bal.src || bal.dat?.coordinatorUrl || cpy.edgeCoordinatorUrl;
  const customFetch = bal.dat?.customFetch;
  const skipHeartbeatLoop = bal.dat?.skipHeartbeatLoop;

  if (!payload || !payload.jobId) {
    const err = 'DISPATCH_REJECTED: Missing SpokeExecutionPayload';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ logisticBit: { idx: 'dispatch-spoke-payload-error', val: 0, src: err } });
    throw new Error(err);
  }

  try {
    const receipt = await executeSpokeDispatchWorkflow(payload, coordinatorUrl, {
      customFetch,
      skipHeartbeatLoop,
    });

    cpy.totalDispatchesExecuted += 1;
    cpy.currentLeaseEpoch = receipt.epoch;
    cpy.activeDispatches[receipt.jobId] = receipt;

    if (bal.slv) {
      bal.slv({
        logisticBit: {
          idx: 'dispatch-spoke-payload',
          val: 1,
          src: receipt.jobId,
          dat: receipt,
        },
      });
    }
  } catch (err: any) {
    process.stderr.write(`${cns} [FAIL] Dispatch workflow failed: ${err.message}\n`);
    if (bal.slv) {
      bal.slv({
        logisticBit: {
          idx: 'dispatch-spoke-payload-error',
          val: 0,
          src: err.message,
        },
      });
    } else {
      throw err;
    }
  }

  return cpy;
};
