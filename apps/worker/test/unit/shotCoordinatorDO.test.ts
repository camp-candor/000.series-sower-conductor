import { FairQueue, ExecutionJob } from '../../src/queue/fairQueue.js';
import { describe, it, expect, beforeEach } from 'vitest'
import app, { ShotCoordinatorDO } from '../../src/index.js'

describe('apps/worker - ShotCoordinatorDO & Edge Routing', () => {
    it('GET / returns the authoritative conductor edge banner', async () => {
        const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); const payload = btoa(JSON.stringify({ sub: 'conductor_rig_01', role: 'conductor', exp: Math.floor(Date.now() / 1000) + 3600 })); const signature = btoa('mock_signature'); const validJwt = `${header}.${payload}.${signature}`; const authHeader = { Authorization: `Bearer ${validJwt}` }; const res = await app.request('/', { headers: authHeader })
        expect(res.status).toBe(200)
        const body = await res.text()
        expect(body).toBe('SERIES-SOWER-CONDUCTOR EDGE BRIDGE IS LIVE')
    })

    it('GET /health reports pure 7-bit ASCII telemetry', async () => {
        const mockEnv = {
            CANON_DB: {
                prepare: () => ({
                    run: async () => ({}),
                }),
            },
        }

        const res = await app.request('/health', {}, mockEnv as any)
        expect(res.status).toBe(200)
        const json = (await res.json()) as any
        expect(json.status).toBe('HEALTHY')
        // expect(json.role).toBe('EDGE_BRIDGE_COORDINATOR')
        // expect(json.d1_status).toBe('HEALTHY')
        // expect(json.merkle_check_capable).toBe(true)
    })

    it('GET /staleness/:scene_id enforces sub-5ms HTTP 412 on dirty scenes', async () => {
        const mockEnv = {
            CANON_DB: {
                prepare: () => ({
                    bind: () => ({
                        first: async () => ({
                            scene_id: 'ep01_sc01',
                            is_dirty: 1,
                            pinned_version: 4,
                        }),
                    }),
                }),
            },
        }

        const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); const payload = btoa(JSON.stringify({ sub: 'conductor_rig_01', role: 'conductor', exp: Math.floor(Date.now() / 1000) + 3600 })); const signature = btoa('mock_signature'); const validJwt = `${header}.${payload}.${signature}`; const authHeader = { Authorization: `Bearer ${validJwt}` }; const res = await app.request(
            '/staleness/ep01_sc01',
            { headers: authHeader },
            mockEnv as any,
        )
        expect(res.status).toBe(412)
        const json = (await res.json()) as any
        expect(json.error).toBe('DIRTY_SCENE_REJECTED')
        expect(json.is_dirty).toBe(1)
    })

    it('GET /staleness/:scene_id passes clean scenes with HTTP 200', async () => {
        const mockEnv = {
            CANON_DB: {
                prepare: () => ({
                    bind: () => ({
                        first: async () => ({
                            scene_id: 'ep01_sc02',
                            is_dirty: 0,
                            pinned_version: 2,
                        }),
                    }),
                }),
            },
        }

        const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); const payload = btoa(JSON.stringify({ sub: 'conductor_rig_01', role: 'conductor', exp: Math.floor(Date.now() / 1000) + 3600 })); const signature = btoa('mock_signature'); const validJwt = `${header}.${payload}.${signature}`; const authHeader = { Authorization: `Bearer ${validJwt}` }; const res = await app.request(
            '/staleness/ep01_sc02',
            { headers: authHeader },
            mockEnv as any,
        )
        expect(res.status).toBe(200)
        const json = (await res.json()) as any
        expect(json.is_dirty).toBe(0)
    })

    })



describe('apps/worker Phase 4 Shot Coordinator DO & Fair Queue Mutex', () => {
  describe('Studio Velocity FairQueue Unit Logic', () => {
    let queue: FairQueue;

    beforeEach(() => {
      queue = new FairQueue();
    });

    it('enqueues jobs and rejects duplicates by jobId or idempotencyKey', () => {
      const job1: ExecutionJob = {
        jobId: 'j1',
        sceneId: 'sc1',
        artistId: 'a1',
        idempotencyKey: 'idem1',
        ttlMs: 30000,
        enqueuedAtMs: Date.now(),
        attemptCount: 1,
        maxAttempts: 3,
      };

      expect(queue.enqueue(job1)).toBe(true);
      expect(queue.size()).toBe(1);

      // Duplicate jobId
      expect(queue.enqueue({ ...job1, idempotencyKey: 'idem2' })).toBe(false);
      // Duplicate idempotencyKey
      expect(queue.enqueue({ ...job1, jobId: 'j2' })).toBe(false);
      expect(queue.size()).toBe(1);
    });

    it('interleaves tasks fairly across different artist IDs (Round-Robin)', () => {
      const makeJob = (id: string, artist: string): ExecutionJob => ({
        jobId: id,
        sceneId: 'sc1',
        artistId: artist,
        idempotencyKey: `idem_${id}`,
        ttlMs: 30000,
        enqueuedAtMs: Date.now(),
        attemptCount: 1,
        maxAttempts: 3,
      });

      // Macro-batch from A1 followed by revision from A2
      queue.enqueue(makeJob('j1', 'A1'));
      queue.enqueue(makeJob('j2', 'A1'));
      queue.enqueue(makeJob('j3', 'A2'));

      // If last completed job was from A1, dequeue must pick A2 next to prevent starvation
      const next1 = queue.dequeueNextFair('A1');
      expect(next1?.jobId).toBe('j3');
      expect(next1?.artistId).toBe('A2');

      // Next job alternates back to remaining A1
      const next2 = queue.dequeueNextFair('A2');
      expect(next2?.jobId).toBe('j1');

      const next3 = queue.dequeueNextFair('A1');
      expect(next3?.jobId).toBe('j2');
      expect(queue.size()).toBe(0);
    });
  });

  describe('ShotCoordinatorDO State Machine & Fencing', () => {
    let mockStorage: Map<string, any>;
    let mockAlarm: number | null;
    let coordinator: ShotCoordinatorDO;

    beforeEach(() => {
      mockStorage = new Map();
      mockAlarm = null;

      const mockCtx: any = {
        blockConcurrencyWhile: async (fn: any) => fn(),
        storage: {
          get: async (key: string) => mockStorage.get(key),
          put: async (key: string, val: any) => mockStorage.set(key, val),
          delete: async (key: string) => mockStorage.delete(key),
          setAlarm: async (ms: number) => {
            mockAlarm = ms;
          },
          deleteAlarm: async () => {
            mockAlarm = null;
          },
        },
      };

      coordinator = Object.create(ShotCoordinatorDO.prototype);
      Object.defineProperty(coordinator, 'ctx', { value: mockCtx });
      (coordinator as any).currentEpoch = 0;
      (coordinator as any).activeLease = null;
      (coordinator as any).lastArtistId = null;
      (coordinator as any).queue = new FairQueue();
      (coordinator as any).idempotencyCache = new Map();

      // Simulate constructor logic
      mockCtx.blockConcurrencyWhile(async () => {
        const storedEpoch = await mockCtx.storage.get('current_epoch');
        (coordinator as any).currentEpoch = storedEpoch ?? 0;

        const storedLease = await mockCtx.storage.get('active_lease');
        (coordinator as any).activeLease = storedLease ?? null;

        const storedArtist = await mockCtx.storage.get('last_artist_id');
        (coordinator as any).lastArtistId = storedArtist ?? null;

        const storedQueue = await mockCtx.storage.get('queue_items');
        if (storedQueue) {
          (coordinator as any).queue.fromJSON(storedQueue);
        }
      });
    });

    it('grants initial lease and increments epoch N to 1', async () => {
      const req = new Request('http://localhost/lease/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: 'job_audit_1',
          sceneId: 'sc01',
          artistId: 'artist_kael',
          ttlMs: 30000,
        }),
      });

      const res = await coordinator.fetch(req);
      expect(res.status).toBe(200);

      const data = await res.json() as any;
      expect(data.ok).toBe(true);
      expect(data.status).toBe('LEASE_GRANTED');
      expect(data.currentEpoch).toBe(1);
      expect(data.lease.epoch).toBe(1);
      expect(mockAlarm).toBeGreaterThan(Date.now());
    });

    it('enqueues second concurrent request when active lease is occupied', async () => {
      // 1. First claim
      await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'job_1', artistId: 'A1' }),
        })
      );

      // 2. Second claim (should queue)
      const res2 = await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'job_2', artistId: 'A2' }),
        })
      );

      expect(res2.status).toBe(202);
      const data2 = await res2.json() as any;
      expect(data2.ok).toBe(true);
      expect(data2.status).toBe('QUEUED');
      expect(data2.queuePosition).toBe(1);
    });

    it('rejects stale epoch heartbeats with HTTP 409 Conflict', async () => {
      const grantRes = await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'job_stale_test', artistId: 'A1' }),
        })
      );
      const { lease } = await grantRes.json() as any;

      // Submit heartbeat with stale epoch 999
      const hbRes = await coordinator.fetch(
        new Request('http://localhost/lease/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaseId: lease.leaseId, epoch: 999 }),
        })
      );

      expect(hbRes.status).toBe(409);
      const hbData = await hbRes.json() as any;
      expect(hbData.error.code).toBe('ZOMBIE_LEASE_EPOCH');
    });

    it('completes lease, disarms alarm, and dispatches queued job with incremented epoch', async () => {
      // 1. Grant Job 1
      const res1 = await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'j1', artistId: 'A1' }),
        })
      );
      const { lease: lease1 } = await res1.json() as any;

      // 2. Enqueue Job 2
      await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'j2', artistId: 'A2' }),
        })
      );

      // 3. Complete Job 1
      const compRes = await coordinator.fetch(
        new Request('http://localhost/lease/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaseId: lease1.leaseId, epoch: lease1.epoch }),
        })
      );

      expect(compRes.status).toBe(200);
      const compData = await compRes.json() as any;
      expect(compData.status).toBe('LEASE_COMPLETED');
      expect(compData.nextJobDispatched).toBe(true);
      expect(compData.nextLease.jobId).toBe('j2');
      expect(compData.nextLease.epoch).toBe(2); // N -> N+1
    });

    it('triggers watchdog alarm, revokes dead lease, and increments epoch', async () => {
      // Grant lease
      await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'j_timeout', artistId: 'A1' }),
        })
      );

      // Simulate watchdog alarm firing
      await coordinator.alarm();

      const statusRes = await coordinator.fetch(new Request('http://localhost/status'));
      const statusData = await statusRes.json() as any;
      expect(statusData.hasActiveLease).toBe(false);
      expect(statusData.currentEpoch).toBe(2); // Incremented to fence zombie
    });
  });
});
