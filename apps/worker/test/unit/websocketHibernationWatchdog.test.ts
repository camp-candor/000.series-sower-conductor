import { describe, it, expect, beforeEach } from 'vitest';
import { FairQueue } from '../../src/queue/fairQueue.js';
import { ShotCoordinatorDO } from '../../src/objects/ShotCoordinatorDO.js';
import app from '../../src/index.js';

describe('apps/worker Phase 5 WebSocket Hibernation & Storage Alarm Watchdog', () => {
  let mockStorage: Map<string, any>;
  let mockAlarm: number | null;
  let coordinator: ShotCoordinatorDO;
  let activeWebSockets: any[];

  beforeEach(() => {
    mockStorage = new Map();
    mockAlarm = null;
    activeWebSockets = [];



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
                  acceptWebSocket: (ws: any, tags: string[]) => {
        ws.tags = tags;
        ws.sentFrames = [];
        ws.accept();
        const originalSend = ws.send.bind(ws);
        ws.send = (msg: string) => { ws.sentFrames.push(msg); originalSend(msg); };
        activeWebSockets.push(ws);
      },
      getWebSockets: (tag?: string) => {
        if (!tag) return activeWebSockets;
        return activeWebSockets.filter((s) => s.tags?.includes(tag));
      },
    };

    coordinator = Object.create(ShotCoordinatorDO.prototype);
    coordinator.ctx = mockCtx;
    coordinator.env = {};
    coordinator.queue = new FairQueue();
    coordinator.idempotencyCache = new Map();
    coordinator.ringBuffer = [];
    coordinator.currentEpoch = 0;
    coordinator.activeLease = null;
    coordinator.lastArtistId = null;
    coordinator.telemetrySeq = 0;
  });

  describe('WebSocket Ingress Gateway Guards', () => {
    it('rejects non-WebSocket HTTP requests to /ws with HTTP 426 Upgrade Required', async () => {
      const res = await app.request('/ws', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXIiLCJyb2xlIjoiYXJ0aXN0IiwiZXhwIjoyMDAwMDAwMDAwfQ.c2lnbmF0dXJl',
        },
      });
      expect(res.status).toBe(426);
      const text = await res.text();
      expect(text).toContain('HTTP 426 Upgrade Required');
    });

    it('upgrades WebSocket connection and returns HTTP 101 Switching Protocols', async () => {
      const req = new Request('http://localhost/ws?role=artist&clientId=client_viewport_01', {
        headers: {
          Upgrade: 'websocket',
        },
      });

      const res = await coordinator.fetch(req);
      expect(res.status).toBe(101);
      expect(res.webSocket).toBeDefined();
      expect(activeWebSockets.length).toBe(1);
      expect(activeWebSockets[0].tags).toContain('artist');
    });
  });

  describe('Telemetry Multiplexing & Replay Ring Buffer', () => {
    it('stamps monotonic sequence counter seq: 1, 2, 3 on broadcast', () => {
      coordinator.broadcastTelemetry('TEST_EVENT_A', { alpha: 1 }, 'all');
      coordinator.broadcastTelemetry('TEST_EVENT_B', { beta: 2 }, 'all');

      const statusRes = coordinator['handleGetStatus']();
      // Inspect private sequence counter via status endpoint
      return statusRes.json().then((data: any) => {
        expect(data.telemetrySeq).toBe(2);
      });
    });

    it('partitions broadcasts: broker frames do not leak to artist sockets', async () => {
      const artistReq = new Request('http://localhost/ws?role=artist', {
        headers: { Upgrade: 'websocket' },
      });
      const brokerReq = new Request('http://localhost/ws?role=broker', {
        headers: { Upgrade: 'websocket' },
      });

      await coordinator.fetch(artistReq);
      await coordinator.fetch(brokerReq);

      expect(activeWebSockets.length).toBe(2);

      const artistSocket = activeWebSockets.find((s) => s.tags?.includes('artist'));
      const brokerSocket = activeWebSockets.find((s) => s.tags?.includes('broker'));

      coordinator.broadcastTelemetry('ARTIST_VIEWPORT_SYNC', { frame: 12 }, 'artist');

      expect(artistSocket.sentFrames.length).toBeGreaterThan(0);
      const lastArtistFrame = JSON.parse(
        artistSocket.sentFrames[artistSocket.sentFrames.length - 1]
      );
      expect(lastArtistFrame.type).toBe('ARTIST_VIEWPORT_SYNC');

      // Assert broker received zero artist frames
      const brokerArtistFrames = brokerSocket.sentFrames.filter((f: string) =>
        f.includes('ARTIST_VIEWPORT_SYNC')
      );
      expect(brokerArtistFrames.length).toBe(0);
    });
  });

  describe('Storage Alarm Watchdog & Three-Strike DLQ Escalation', () => {
    it('arms storage alarm on lease grant and deletes alarm on completion', async () => {
      const grantRes = await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'j_alarm_test', artistId: 'a1' }),
        })
      );
      const { lease } = (await grantRes.json()) as any;
      expect(mockAlarm).toBeGreaterThan(Date.now());

      await coordinator.fetch(
        new Request('http://localhost/lease/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaseId: lease.leaseId, epoch: lease.epoch }),
        })
      );

      expect(mockAlarm).toBeNull(); // Universal disarm
    });

    it('trips three-strike circuit breaker into DLQ when attempts reach maximum', async () => {
      // 1. Initial Grant (Attempt 1)
      await coordinator.fetch(
        new Request('http://localhost/lease/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: 'j_flaky', artistId: 'a1' }),
        })
      );

      // Strike 1: Alarm fires (re-queues with attemptCount = 2)
      await coordinator.alarm();
      expect(mockStorage.has('dlq:j_flaky')).toBe(false);

      // Wait for re-queued job to be dispatched or manually trigger its cycle
      // Strike 2: Alarm fires again
      await coordinator.alarm();
      expect(mockStorage.has('dlq:j_flaky')).toBe(false);

      // Strike 3: Alarm fires third time -> DLQ Tripwire
      await coordinator.alarm();
      expect(mockStorage.has('dlq:j_flaky')).toBe(true);

      const dlqItem = mockStorage.get('dlq:j_flaky');
      expect(dlqItem.reason).toBe('MAX_ATTEMPTS_EXCEEDED_WATCHDOG_TIMEOUT');
      expect(dlqItem.jobId).toBe('j_flaky');
    });
  });
});
