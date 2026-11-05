import { DurableObject } from 'cloudflare:workers';
import { ExecutionJob, FairQueue } from '../queue/fairQueue.js';

export interface HardwareLease {
  leaseId: string;
  jobId: string;
  sceneId: string;
  artistId: string;
  epoch: number;
  grantedAtMs: number;
  ttlMs: number;
  expiresAtMs: number;
}

export class ShotCoordinatorDO extends DurableObject {
  private currentEpoch: number = 0;
  private activeLease: HardwareLease | null = null;
  private lastArtistId: string | null = null;
  private queue: FairQueue = new FairQueue();
  private idempotencyCache: Map<string, { response: any; timestampMs: number }> = new Map();

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      const storedEpoch = await this.ctx.storage.get<number>('current_epoch');
      this.currentEpoch = storedEpoch ?? 0;

      const storedLease = await this.ctx.storage.get<HardwareLease>('active_lease');
      this.activeLease = storedLease ?? null;

      const storedArtist = await this.ctx.storage.get<string>('last_artist_id');
      this.lastArtistId = storedArtist ?? null;

      const storedQueue = await this.ctx.storage.get<ExecutionJob[]>('queue_items');
      if (storedQueue) {
        this.queue.fromJSON(storedQueue);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'GET' && path === '/status') {
      return this.handleGetStatus();
    }

    if (method === 'POST') {
      if (path === '/lease/request' || path === '/lease/acquire') {
        return this.handleLeaseRequest(request);
      }
      if (path === '/lease/heartbeat') {
        return this.handleLeaseHeartbeat(request);
      }
      if (path === '/lease/complete') {
        return this.handleLeaseComplete(request);
      }
      if (path === '/lease/abort') {
        return this.handleLeaseAbort(request);
      }
    }

    return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private handleGetStatus(): Response {
    return new Response(
      JSON.stringify({
        ok: true,
        currentEpoch: this.currentEpoch,
        hasActiveLease: this.activeLease !== null,
        activeLease: this.activeLease,
        queueLength: this.queue.size(),
        lastArtistId: this.lastArtistId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  private async handleLeaseRequest(request: Request): Promise<Response> {
    const body: any = await request.json().catch(() => ({}));
    const jobId = body.jobId || `job_${Date.now()}`;
    const sceneId = body.sceneId || 'sc01';
    const artistId = body.artistId || 'artist_default';
    const idempotencyKey = body.idempotencyKey || `idem_${jobId}`;
    const ttlMs = Number(body.ttlMs) || 30000;

    // Idempotency check
    if (this.idempotencyCache.has(idempotencyKey)) {
      const cached = this.idempotencyCache.get(idempotencyKey)!;
      return new Response(JSON.stringify(cached.response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'IDEMPOTENT_HIT' },
      });
    }

    // Hardware Mutex Check
    if (this.activeLease !== null) {
      const job: ExecutionJob = {
        jobId,
        sceneId,
        artistId,
        idempotencyKey,
        ttlMs,
        enqueuedAtMs: Date.now(),
        attemptCount: 1,
        maxAttempts: 3,
      };

      const enqueued = this.queue.enqueue(job);
      if (enqueued) {
        await this.ctx.storage.put('queue_items', this.queue.toJSON());
      }

      const responsePayload = {
        ok: true,
        status: 'QUEUED',
        queuePosition: this.queue.size(),
        jobId,
        currentEpoch: this.currentEpoch,
      };

      this.idempotencyCache.set(idempotencyKey, { response: responsePayload, timestampMs: Date.now() });

      return new Response(JSON.stringify(responsePayload), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Grant Active Lease: Monotonic Epoch Increment N -> N+1
    this.currentEpoch += 1;
    const now = Date.now();
    const lease: HardwareLease = {
      leaseId: `lease_${jobId}_${now}`,
      jobId,
      sceneId,
      artistId,
      epoch: this.currentEpoch,
      grantedAtMs: now,
      ttlMs,
      expiresAtMs: now + ttlMs,
    };

    this.activeLease = lease;
    this.lastArtistId = artistId;

    await this.ctx.storage.put('active_lease', lease);
    await this.ctx.storage.put('current_epoch', this.currentEpoch);
    await this.ctx.storage.put('last_artist_id', this.lastArtistId);

    // Arm Watchdog Storage Alarm
    await this.ctx.storage.setAlarm(lease.expiresAtMs);

    const responsePayload = {
      ok: true,
      status: 'LEASE_GRANTED',
      lease,
      currentEpoch: this.currentEpoch,
    };

    this.idempotencyCache.set(idempotencyKey, { response: responsePayload, timestampMs: now });

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleLeaseHeartbeat(request: Request): Promise<Response> {
    const body: any = await request.json().catch(() => ({}));
    const leaseId = body.leaseId;
    const incomingEpoch = Number(body.epoch);

    // Monotonic Epoch Fencing Assertion
    if (
      !this.activeLease ||
      this.activeLease.leaseId !== leaseId ||
      incomingEpoch !== this.currentEpoch
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: 'ZOMBIE_LEASE_EPOCH',
            message: `Heartbeat rejected: incoming epoch ${incomingEpoch} does not match active epoch ${this.currentEpoch}`,
            currentEpoch: this.currentEpoch,
          },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extend Lease
    const now = Date.now();
    this.activeLease.expiresAtMs = now + this.activeLease.ttlMs;

    await this.ctx.storage.put('active_lease', this.activeLease);
    await this.ctx.storage.setAlarm(this.activeLease.expiresAtMs);

    return new Response(
      JSON.stringify({
        ok: true,
        status: 'HEARTBEAT_ACK',
        leaseId,
        epoch: this.currentEpoch,
        expiresAtMs: this.activeLease.expiresAtMs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  private async handleLeaseComplete(request: Request): Promise<Response> {
    const body: any = await request.json().catch(() => ({}));
    const leaseId = body.leaseId;
    const incomingEpoch = Number(body.epoch);

    // Monotonic Epoch Fencing Assertion
    if (
      !this.activeLease ||
      this.activeLease.leaseId !== leaseId ||
      incomingEpoch !== this.currentEpoch
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: 'ZOMBIE_LEASE_EPOCH',
            message: `Completion rejected: incoming epoch ${incomingEpoch} is stale; active epoch is ${this.currentEpoch}`,
            currentEpoch: this.currentEpoch,
          },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Universal Disarm on leaving RUNNING
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.delete('active_lease');
    this.activeLease = null;

    // Dispatch next fair job if available
    const nextJob = this.queue.dequeueNextFair(this.lastArtistId);
    let nextLease: HardwareLease | null = null;

    if (nextJob) {
      this.currentEpoch += 1;
      const now = Date.now();
      nextLease = {
        leaseId: `lease_${nextJob.jobId}_${now}`,
        jobId: nextJob.jobId,
        sceneId: nextJob.sceneId,
        artistId: nextJob.artistId,
        epoch: this.currentEpoch,
        grantedAtMs: now,
        ttlMs: nextJob.ttlMs,
        expiresAtMs: now + nextJob.ttlMs,
      };

      this.activeLease = nextLease;
      this.lastArtistId = nextJob.artistId;

      await this.ctx.storage.put('active_lease', nextLease);
      await this.ctx.storage.put('current_epoch', this.currentEpoch);
      await this.ctx.storage.put('last_artist_id', this.lastArtistId);
      await this.ctx.storage.put('queue_items', this.queue.toJSON());
      await this.ctx.storage.setAlarm(nextLease.expiresAtMs);
    } else {
      await this.ctx.storage.put('queue_items', []);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        status: 'LEASE_COMPLETED',
        completedLeaseId: leaseId,
        nextJobDispatched: nextLease !== null,
        nextLease,
        currentEpoch: this.currentEpoch,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  private async handleLeaseAbort(request: Request): Promise<Response> {
    const body: any = await request.json().catch(() => ({}));
    const leaseId = body.leaseId;

    if (this.activeLease && this.activeLease.leaseId === leaseId) {
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.delete('active_lease');
      this.activeLease = null;
      this.currentEpoch += 1;
      await this.ctx.storage.put('current_epoch', this.currentEpoch);

      // Dequeue next
      const nextJob = this.queue.dequeueNextFair(this.lastArtistId);
      if (nextJob) {
        this.currentEpoch += 1;
        const now = Date.now();
        const nextLease: HardwareLease = {
          leaseId: `lease_${nextJob.jobId}_${now}`,
          jobId: nextJob.jobId,
          sceneId: nextJob.sceneId,
          artistId: nextJob.artistId,
          epoch: this.currentEpoch,
          grantedAtMs: now,
          ttlMs: nextJob.ttlMs,
          expiresAtMs: now + nextJob.ttlMs,
        };
        this.activeLease = nextLease;
        this.lastArtistId = nextJob.artistId;

        await this.ctx.storage.put('active_lease', nextLease);
        await this.ctx.storage.put('current_epoch', this.currentEpoch);
        await this.ctx.storage.put('last_artist_id', this.lastArtistId);
        await this.ctx.storage.put('queue_items', this.queue.toJSON());
        await this.ctx.storage.setAlarm(nextLease.expiresAtMs);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        status: 'LEASE_ABORTED',
        currentEpoch: this.currentEpoch,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  async alarm(): Promise<void> {
    // Watchdog Alarm Triggered: Active worker timed out
    if (this.activeLease) {
      const expiredJobId = this.activeLease.jobId;
      this.activeLease = null;
      await this.ctx.storage.delete('active_lease');

      // Monotonically advance epoch to fence the timed-out zombie worker
      this.currentEpoch += 1;
      await this.ctx.storage.put('current_epoch', this.currentEpoch);

      // Promote next fair task
      const nextJob = this.queue.dequeueNextFair(this.lastArtistId);
      if (nextJob) {
        this.currentEpoch += 1;
        const now = Date.now();
        const nextLease: HardwareLease = {
          leaseId: `lease_${nextJob.jobId}_${now}`,
          jobId: nextJob.jobId,
          sceneId: nextJob.sceneId,
          artistId: nextJob.artistId,
          epoch: this.currentEpoch,
          grantedAtMs: now,
          ttlMs: nextJob.ttlMs,
          expiresAtMs: now + nextJob.ttlMs,
        };
        this.activeLease = nextLease;
        this.lastArtistId = nextJob.artistId;

        await this.ctx.storage.put('active_lease', nextLease);
        await this.ctx.storage.put('current_epoch', this.currentEpoch);
        await this.ctx.storage.put('last_artist_id', this.lastArtistId);
        await this.ctx.storage.put('queue_items', this.queue.toJSON());
        await this.ctx.storage.setAlarm(nextLease.expiresAtMs);
      }
    }
  }
}
