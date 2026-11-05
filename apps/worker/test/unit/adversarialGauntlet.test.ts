import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('cloudflare:workers', () => ({
  DurableObject: class MockDurableObject {
    constructor(public ctx: any, public env: any) {}
  }
}));
import { ShotCoordinatorDO } from '../../src/objects/ShotCoordinatorDO.js';
import { FairQueue, ExecutionJob } from '../../src/queue/fairQueue.js';

describe('apps/worker Phase 8 Split-Brain Zombie Epoch & Concurrency Fencing Gauntlet', () => {
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
      acceptWebSocket: () => {},
      getWebSockets: () => [],
    };

    coordinator = new ShotCoordinatorDO(mockCtx, {});
  });

  it('rejects stale epoch heartbeats following watchdog timeout fence (HTTP 409)', async () => {
    // 1. Worker claims lease under Epoch 1
    const grantRes = await coordinator.fetch(
      new Request('http://localhost/lease/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: 'j_partition_01', artistId: 'a1', ttlMs: 30000 }),
      })
    );
    const { lease } = await grantRes.json();
    expect(lease.epoch).toBe(1);

    // 2. Simulated network partition: 30s watchdog alarm fires, advancing epoch 1 -> 2
    await coordinator.alarm();

    // 3. Partitioned worker attempts to renew lease presenting stale Epoch 1
    const hbRes = await coordinator.fetch(
      new Request('http://localhost/lease/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.leaseId, epoch: 1 }),
      })
    );

    expect(hbRes.status).toBe(409);
    const hbData = await hbRes.json();
    expect(hbData.ok).toBe(false);
    expect(hbData.error.code).toBe('ZOMBIE_LEASE_EPOCH');
    expect(hbData.error.currentEpoch).toBeGreaterThan(1);
  });

  it('rejects late render completion from partitioned worker presenting stale epoch (HTTP 409)', async () => {
    // 1. Worker claims lease under Epoch 1
    const grantRes = await coordinator.fetch(
      new Request('http://localhost/lease/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: 'j_zombie_render', artistId: 'a1', ttlMs: 30000 }),
      })
    );
    const { lease } = await grantRes.json();

    // 2. Coordinator aborts or revokes lease, incrementing monotonic epoch
    await coordinator.fetch(
      new Request('http://localhost/lease/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.leaseId }),
      })
    );

    // 3. Stale worker finishes rendering and attempts to commit completion with Epoch 1
    const compRes = await coordinator.fetch(
      new Request('http://localhost/lease/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.leaseId, epoch: 1 }),
      })
    );

    expect(compRes.status).toBe(409);
    const compData = await compRes.json();
    expect(compData.ok).toBe(false);
    expect(compData.error.code).toBe('ZOMBIE_LEASE_EPOCH');
  });

  it('guarantees fair round-robin interleaving preventing macro-batch starvation', () => {
    const queue = new FairQueue();
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

    // Macro-batch of 3 jobs from Artist 1, followed by single revision from Artist 2
    queue.enqueue(makeJob('j1', 'Artist_A1'));
    queue.enqueue(makeJob('j2', 'Artist_A1'));
    queue.enqueue(makeJob('j3', 'Artist_A1'));
    queue.enqueue(makeJob('j4', 'Artist_A2'));

    // If Artist A1 just finished, queue MUST interleave and select Artist A2 next
    const picked1 = queue.dequeueNextFair('Artist_A1');
    expect(picked1?.jobId).toBe('j4');
    expect(picked1?.artistId).toBe('Artist_A2');

    // Next selection returns to Artist A1
    const picked2 = queue.dequeueNextFair('Artist_A2');
    expect(picked2?.jobId).toBe('j1');
    expect(picked2?.artistId).toBe('Artist_A1');
  });

  it('quarantines task to Dead-Letter Queue (DLQ) after 3 consecutive watchdog timeouts', async () => {
    // 1. Initial grant (Attempt 1)
    await coordinator.fetch(
      new Request('http://localhost/lease/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: 'j_flaky_gpu', artistId: 'a1' }),
      })
    );

    // Strike 1: Timeout -> Requeues with attemptCount = 2
    await coordinator.alarm();
    expect(mockStorage.has('dlq:j_flaky_gpu')).toBe(false);

    // Strike 2: Timeout -> Requeues with attemptCount = 3
    await coordinator.alarm();
    expect(mockStorage.has('dlq:j_flaky_gpu')).toBe(false);

    // Strike 3: Timeout -> Exceeds max attempts, trips circuit breaker to DLQ
    await coordinator.alarm();
    expect(mockStorage.has('dlq:j_flaky_gpu')).toBe(true);

    const record = mockStorage.get('dlq:j_flaky_gpu');
    expect(record.jobId).toBe('j_flaky_gpu');
    expect(record.reason).toBe('MAX_ATTEMPTS_EXCEEDED_WATCHDOG_TIMEOUT');
    expect(record.attemptCount).toBe(3);
  });
});
