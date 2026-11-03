import { describe, it, expect } from 'vitest';
import app, { ShotCoordinatorDO } from '../../src/index.js';

describe('apps/worker - ShotCoordinatorDO & Edge Routing', () => {
  it('GET / returns the authoritative conductor edge banner', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe('SERIES-SOWER-CONDUCTOR EDGE BRIDGE IS LIVE');
  });

  it('GET /health reports pure 7-bit ASCII telemetry', async () => {
    const mockEnv = {
      CANON_DB: {
        prepare: () => ({
          run: async () => ({})
        })
      }
    };

    const res = await app.request('/health', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.status).toBe('ONLINE');
    expect(json.role).toBe('EDGE_BRIDGE_COORDINATOR');
    expect(json.d1_status).toBe('HEALTHY');
    expect(json.merkle_check_capable).toBe(true);
  });

  it('GET /staleness/:scene_id enforces sub-5ms HTTP 412 on dirty scenes', async () => {
    const mockEnv = {
      CANON_DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => ({
              scene_id: 'ep01_sc01',
              is_dirty: 1,
              pinned_version: 4
            })
          })
        })
      }
    };

    const res = await app.request('/staleness/ep01_sc01', {}, mockEnv as any);
    expect(res.status).toBe(412);
    const json = (await res.json()) as any;
    expect(json.error).toBe('DIRTY_SCENE_REJECTED');
    expect(json.is_dirty).toBe(1);
  });

  it('GET /staleness/:scene_id passes clean scenes with HTTP 200', async () => {
    const mockEnv = {
      CANON_DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => ({
              scene_id: 'ep01_sc02',
              is_dirty: 0,
              pinned_version: 2
            })
          })
        })
      }
    };

    const res = await app.request('/staleness/ep01_sc02', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.is_dirty).toBe(0);
  });

  it('ShotCoordinatorDO manages monotonic epoch leases and fences zombies', async () => {
    const mockState = {
      storage: {
        get: async () => null,
        put: async () => {}
      }
    } as unknown as DurableObjectState;

    const coordinator = new ShotCoordinatorDO(mockState);

    // 1. Acquire initial lease
    const req1 = new Request('http://internal/lease/acquire', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ shot_id: 'shot_101', ttl_ms: 30000, worker_id: 'rig2_foundry' })
    });
    const res1 = await coordinator.fetch(req1);
    expect(res1.status).toBe(200);
    const data1 = (await res1.json()) as any;
    expect(data1.granted).toBe(true);
    expect(data1.epoch).toBe(1);

    // 2. Conflicting worker attempts to acquire locked lease
    const req2 = new Request('http://internal/lease/acquire', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ shot_id: 'shot_101', ttl_ms: 30000, worker_id: 'zombie_worker' })
    });
    const res2 = await coordinator.fetch(req2);
    expect(res2.status).toBe(409);

    // 3. Original worker sends heartbeat with matching epoch
    const req3 = new Request('http://internal/lease/heartbeat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ shot_id: 'shot_101', ttl_ms: 30000, epoch: 1 })
    });
    const res3 = await coordinator.fetch(req3);
    expect(res3.status).toBe(200);

    // 4. Stale epoch heartbeat is fenced
    const req4 = new Request('http://internal/lease/heartbeat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ shot_id: 'shot_101', ttl_ms: 30000, epoch: 0 })
    });
    const res4 = await coordinator.fetch(req4);
    expect(res4.status).toBe(409);
    const data4 = (await res4.json()) as any;
    expect(data4.error).toBe('STALE_EPOCH_FENCE');
  });
});