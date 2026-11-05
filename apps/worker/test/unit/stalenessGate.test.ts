import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/index.js';

describe('apps/worker Phase 8 Precondition HTTP 412 Staleness Block Verification', () => {
  let validJwt: string;

  beforeEach(() => {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 'conductor_rig_01',
        role: 'conductor',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    );
    validJwt = `${header}.${payload}.${btoa('sig')}`;
  });

  const makeMockDb = (dirtyCount: number) => ({
    prepare: (_query: string) => ({
      bind: (..._args: any[]) => ({
        first: async () => ({ dirty_count: dirtyCount }),
        run: async () => ({ success: true }),
      }),
    }),
  });

  it('rejects dirty scene targeting with HTTP 412 Precondition Failed at T0 = $0.00', async () => {
    const mockDb = makeMockDb(3);
    const res = await app.request(
      '/staleness/ep01_sc01',
      {
        headers: {
          Authorization: `Bearer ${validJwt}`,
        },
      },
      { CANON_DB: mockDb }
    );

    expect(res.status).toBe(412);
    const data = await res.json() as any;
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('DIRTY_SCENE_REJECTED');
    expect(data.error.sceneId).toBe('ep01_sc01');
    expect(data.error.dirtyCount).toBe(3);
    expect(data.error.t0Spend).toBe('$0.00');

    // Assert sub-5ms gate evaluation latency header exists
    const latencyHeader = res.headers.get('X-Continuity-Latency-Ms');
    expect(latencyHeader).toBeDefined();
    expect(Number(latencyHeader)).toBeLessThan(50);
  });

  it('blocks lease request targeting dirty scene with HTTP 412 before actor invocation', async () => {
    const mockDb = makeMockDb(1);
    const res = await app.request(
      '/lease/request',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${validJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sceneId: 'ep01_sc02',
          jobId: 'job_dirty_test',
          artistId: 'artist_kael',
        }),
      },
      { CANON_DB: mockDb }
    );

    expect(res.status).toBe(412);
    const data = await res.json() as any;
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe('DIRTY_SCENE_REJECTED');
    expect(data.error.dirtyCount).toBe(1);
  });

  it('permits clean scene targeting with HTTP 200 when dirty count is zero', async () => {
    const mockDb = makeMockDb(0);
    const res = await app.request(
      '/staleness/ep01_sc01',
      {
        headers: {
          Authorization: `Bearer ${validJwt}`,
        },
      },
      { CANON_DB: mockDb }
    );

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.ok).toBe(true);
    expect(data.status).toBe('CLEAN');
    expect(data.isDirty).toBe(false);
    expect(data.dirtyCount).toBe(0);
  });

  it('passes through safely when no scene ID is provided in request context', async () => {
    const mockDb = makeMockDb(5);
    const res = await app.request(
      '/health',
      {},
      { CANON_DB: mockDb }
    );

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.ok).toBe(true);
    expect(data.service).toBe('worker-sower-conductor');
  });
});
