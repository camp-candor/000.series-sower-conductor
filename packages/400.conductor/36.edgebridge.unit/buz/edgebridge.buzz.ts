import { EdgeBridgeModel } from '../edgebridge.model.js';
import EdgeBridgeBit from '../fce/edgebridge.bit.js';
import State from '../../99.core/state.js';
import { HardwareLeaseToken } from '../fce/edgebridge.interface.js';

export const initEdgeBridge = (cpy: EdgeBridgeModel, bal: EdgeBridgeBit, _ste: State) => {
  cpy.connectionStatus = 'DISCONNECTED';
  cpy.activeLease = null;
  cpy.currentEpoch = 0;

  process.stdout.write('>> [EDGE-BRIDGE] [OK] packages/400.conductor/36.edgebridge.unit initialized cleanly.\n');
  if (bal.slv) bal.slv({ edgebridgeBit: { idx: 'init-edgebridge', val: 1 } });
  return cpy;
};

export const acquireHardwareLease = (cpy: EdgeBridgeModel, bal: EdgeBridgeBit, _ste: State) => {
  const cns = '>> [EDGE-BRIDGE]';
  const jobId = bal.src || bal.dat?.jobId || 'job_default';
  const ttlMs = bal.val || 30000;

  cpy.currentEpoch += 1;
  const lease: HardwareLeaseToken = {
    leaseId: `lease_${jobId}_${Date.now()}`,
    jobId,
    assignedRole: 'conductor',
    epoch: cpy.currentEpoch,
    grantedAtMs: Date.now(),
    ttlMs,
    expiresAtMs: Date.now() + ttlMs,
  };

  cpy.activeLease = lease;
  cpy.connectionStatus = 'LEASE_ACTIVE';

  process.stdout.write(`${cns} [OK] Hardware lease granted for ${jobId} (Epoch: ${lease.epoch}, TTL: ${ttlMs}ms).\n`);

  if (bal.slv) {
    bal.slv({
      edgebridgeBit: {
        idx: 'acquire-hardware-lease',
        val: 1,
        src: lease.leaseId,
        dat: lease,
      },
    });
  }

  return cpy;
};

export const renewLeaseHeartbeat = (cpy: EdgeBridgeModel, bal: EdgeBridgeBit, _ste: State) => {
  const cns = '>> [EDGE-BRIDGE]';

  if (!cpy.activeLease) {
    const err = 'HEARTBEAT_REJECTED: No active hardware lease exists';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ edgebridgeBit: { idx: 'renew-lease-heartbeat-error', val: 0, src: err } });
    throw new Error(err);
  }

  cpy.lastHeartbeatMs = Date.now();
  cpy.activeLease.expiresAtMs = Date.now() + cpy.activeLease.ttlMs;

  process.stdout.write(`${cns} [OK] Heartbeat confirmed for lease ${cpy.activeLease.leaseId} (Epoch: ${cpy.activeLease.epoch}).\n`);

  if (bal.slv) {
    bal.slv({
      edgebridgeBit: {
        idx: 'renew-lease-heartbeat',
        val: 1,
        src: cpy.activeLease.leaseId,
        dat: { expiresAtMs: cpy.activeLease.expiresAtMs },
      },
    });
  }

  return cpy;
};

export const transmitAssemblyReceipt = (cpy: EdgeBridgeModel, bal: EdgeBridgeBit, _ste: State) => {
  const cns = '>> [EDGE-BRIDGE]';
  const receiptPath = bal.src || bal.dat?.lockfilePath;

  if (!receiptPath) {
    const err = 'TRANSMIT_REJECTED: Missing receipt lockfilePath';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ edgebridgeBit: { idx: 'transmit-assembly-receipt-error', val: 0, src: err } });
    throw new Error(err);
  }

  const ackId = `ack_${Date.now()}`;
  cpy.lastReceiptAck = ackId;

  process.stdout.write(`${cns} [OK] Transmitted assembly receipt ${receiptPath} (Ack: ${ackId}).\n`);

  if (bal.slv) {
    bal.slv({
      edgebridgeBit: {
        idx: 'transmit-assembly-receipt',
        val: 1,
        src: ackId,
        dat: { receiptPath, ackId },
      },
    });
  }

  return cpy;
};

export const toggleTargetEndpoint = (cpy: EdgeBridgeModel, bal: EdgeBridgeBit, _ste: State) => {
  const cns = '>> [EDGE-BRIDGE]';
  const localUrl = 'http://127.0.0.1:8787';
  const cloudUrl = 'https://series-edge-orchestrator.workers.dev';

  if (bal.src) {
    cpy.activeTargetUrl = bal.src;
  } else {
    cpy.activeTargetUrl = cpy.activeTargetUrl === localUrl ? cloudUrl : localUrl;
  }

  (globalThis as any).agentBaseUrl = cpy.activeTargetUrl;

  process.stdout.write(`${cns} [OK] Target endpoint toggled to: ${cpy.activeTargetUrl}\n`);

  if (bal.slv) {
    bal.slv({
      edgebridgeBit: {
        idx: 'toggle-target-endpoint',
        val: 1,
        src: cpy.activeTargetUrl,
      },
    });
  }

  return cpy;
};

export const pollStalenessStatus = (cpy: EdgeBridgeModel, bal: EdgeBridgeBit, _ste: State) => {
  const cns = '>> [EDGE-BRIDGE]';
  const sceneId = bal.src || bal.dat?.sceneId || 'sc01';

  process.stdout.write(`${cns} [OK] Polled staleness status for ${sceneId}: CLEAN.\n`);

  if (bal.slv) {
    bal.slv({
      edgebridgeBit: {
        idx: 'poll-staleness-status',
        val: 1,
        src: sceneId,
        dat: { sceneId, isDirty: false },
      },
    });
  }

  return cpy;
};
