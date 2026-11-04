import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sim from '../hunt.js';
import * as ActEdge from '../36.edgebridge.unit/edgebridge.action.js';
import UnitData from '../BEE.js';

describe('packages/400.conductor 36.edgebridge.unit Candor Unit Scaffolding', () => {
  it('strictly contains zero src/ directory in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('initializes UnitData with 400.conductor index and mounts edgebridge reducer', () => {
    const data = new UnitData();
    expect(data.idx).toBe('400.conductor');
    expect(data).toHaveProperty('edgebridge');
  });

  it('dispatches INIT_EDGEBRIDGE cleanly via sim.hunt', async () => {
    const res = await sim.hunt!(ActEdge.INIT_EDGEBRIDGE, {});
    expect(res).toBeDefined();
    expect(res.edgebridgeBit.val).toBe(1);
    expect(res.edgebridgeBit.idx).toBe('init-edgebridge');
  });

  it('acquires hardware lease and advances monotonic epoch', async () => {
    const res = await sim.hunt!(ActEdge.ACQUIRE_HARDWARE_LEASE, {
      src: 'job_test_001',
      val: 30000,
    });
    expect(res).toBeDefined();
    expect(res.edgebridgeBit.val).toBe(1);
    expect(res.edgebridgeBit.dat.epoch).toBeGreaterThan(0);
    expect(res.edgebridgeBit.dat.jobId).toBe('job_test_001');
  });

  it('renews active lease heartbeat cleanly via sim.hunt', async () => {
    const res = await sim.hunt!(ActEdge.RENEW_LEASE_HEARTBEAT, {});
    expect(res).toBeDefined();
    expect(res.edgebridgeBit.val).toBe(1);
    expect(res.edgebridgeBit.dat.expiresAtMs).toBeGreaterThan(Date.now());
  });

  it('toggles target endpoint between local loopback and cloud edge', async () => {
    const res1 = await sim.hunt!(ActEdge.TOGGLE_TARGET_ENDPOINT, {});
    expect(res1.edgebridgeBit.val).toBe(1);
    const toggledUrl = res1.edgebridgeBit.src;

    const res2 = await sim.hunt!(ActEdge.TOGGLE_TARGET_ENDPOINT, {});
    expect(res2.edgebridgeBit.val).toBe(1);
    expect(res2.edgebridgeBit.src).not.toBe(toggledUrl);
  });

  it('polls scene staleness status and returns clean indicator', async () => {
    const res = await sim.hunt!(ActEdge.POLL_STALENESS_STATUS, {
      src: 'ep01_sc01',
    });
    expect(res).toBeDefined();
    expect(res.edgebridgeBit.val).toBe(1);
    expect(res.edgebridgeBit.dat.isDirty).toBe(false);
  });
});
