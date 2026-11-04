import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveCoordinationEndpoint,
  setRuntimeEndpoint,
  clearRuntimeEndpoint,
} from '../36.edgebridge.unit/buz/endpointResolver.buzz.js';
import { dispatchEdgeHttpRequest } from '../36.edgebridge.unit/buz/restClient.buzz.js';
import { spawnLeaseHeartbeat } from '../36.edgebridge.unit/buz/websocketClient.buzz.js';
import { queryLocalContinuityStaleness } from '../36.edgebridge.unit/buz/localContinuityFallback.buzz.js';

describe('packages/400.conductor 36.edgebridge.unit Simulation Transport Layer', () => {
  beforeEach(() => {
    clearRuntimeEndpoint();
    delete (globalThis as any).packageBaseUrl;
    delete process.env.WORKER_URL;
  });

  afterEach(() => {
    clearRuntimeEndpoint();
    vi.restoreAllMocks();
  });

  it('strictly asserts zero src/ directory exists in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('resolves endpoints across the 4-tier cascade dynamically without caching', () => {
    // Tier 4: Default local loopback
    const res4 = resolveCoordinationEndpoint();
    expect(res4.resolvedUrl).toBe('http://127.0.0.1:8787');
    expect(res4.sourceTier).toBe('LOCAL_DEFAULT');

    // Tier 3: Process environment variable
    process.env.WORKER_URL = 'http://127.0.0.1:9090';
    const res3 = resolveCoordinationEndpoint();
    expect(res3.resolvedUrl).toBe('http://127.0.0.1:9090');
    expect(res3.sourceTier).toBe('ENV_CONFIG');

    // Tier 2: Package override
    (globalThis as any).packageBaseUrl = 'http://127.0.0.1:9191';
    const res2 = resolveCoordinationEndpoint();
    expect(res2.resolvedUrl).toBe('http://127.0.0.1:9191');
    expect(res2.sourceTier).toBe('PACKAGE_OVERRIDE');

    // Tier 1: Switchboard runtime override
    setRuntimeEndpoint('https://series-edge-orchestrator.workers.dev');
    const res1 = resolveCoordinationEndpoint();
    expect(res1.resolvedUrl).toBe('https://series-edge-orchestrator.workers.dev');
    expect(res1.sourceTier).toBe('SWITCHBOARD');
  });

  it('dispatches mock HTTP requests and handles HTTP 412 Precondition Failed at T0=$0.00', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 412,
        json: async () => ({ reason: 'DIRTY_DEPENDENCIES_DETECTED' }),
      })
    );

    const res = await dispatchEdgeHttpRequest({
      method: 'GET',
      endpointPath: '/staleness/ep01_sc01',
    });

    expect(res.ok).toBe(false);
    expect(res.status).toBe(412);
    expect(res.error?.code).toBe('DIRTY_SCENE_REJECTED');
  });

  it('spawns lease heartbeat session and verifies lifecycle stop', () => {
    vi.useFakeTimers();

    const ackSpy = vi.fn();
    const session = spawnLeaseHeartbeat({
      leaseId: 'lease_mock_01',
      epoch: 1,
      intervalMs: 1000,
      onHeartbeatAck: ackSpy,
    });

    expect(session.isRunning()).toBe(true);
    session.stop();
    expect(session.isRunning()).toBe(false);

    vi.useRealTimers();
  });

  it('queries fallback SQLite continuity staleness safely on missing pilot.db', () => {
    const res = queryLocalContinuityStaleness('ep01_sc01', '/tmp/nonexistent_pilot.db');
    expect(res.sceneId).toBe('ep01_sc01');
    expect(res.isDirty).toBe(false);
    expect(res.source).toBe('MEMORY_STUB');
  });
});
