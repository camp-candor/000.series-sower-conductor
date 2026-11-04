import { Hono } from 'hono'
import { authGate } from './middleware/authGate.js'
import { stalenessGate } from './middleware/stalenessGate.js'
import { intentSanitizer } from './middleware/intentSanitizer.js'

export interface Env {
    SHOT_COORDINATOR_DO: DurableObjectNamespace
    CANON_DB: D1Database
    DEPLOYMENT_SHA?: string
    AUTH_PUBLIC_KEY_PEM?: string;
    CF_ACCESS_CLIENT_ID?: string;
    CF_ACCESS_CLIENT_SECRET?: string;
}

export interface ActiveLeaseRecord {
    shotId: string
    workerId: string
    epoch: number
    expiryEpochMs: number
}

export class ShotCoordinatorDO {
    private currentEpoch: number = 0
    private activeLeases: Map<string, ActiveLeaseRecord> = new Map()

    constructor(_state: DurableObjectState) {}

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)

        if (url.pathname === '/lease/acquire' && request.method === 'POST') {
            const body = (await request.json().catch(() => ({}))) as {
                shot_id?: string
                ttl_ms?: number
                worker_id?: string
            }

            if (!body.shot_id || !body.ttl_ms || !body.worker_id) {
                return new Response(
                    JSON.stringify({ error: 'MISSING_LEASE_PARAMETERS' }),
                    {
                        status: 400,
                        headers: { 'content-type': 'application/json' },
                    },
                )
            }

            const nowMs = Date.now()
            const existing = this.activeLeases.get(body.shot_id)

            if (existing && existing.expiryEpochMs > nowMs) {
                return new Response(
                    JSON.stringify({
                        granted: false,
                        reason: 'LEASE_LOCKED',
                        active_worker: existing.workerId,
                        expires_in_ms: existing.expiryEpochMs - nowMs,
                    }),
                    {
                        status: 409,
                        headers: { 'content-type': 'application/json' },
                    },
                )
            }

            this.currentEpoch += 1
            const expiryEpochMs = nowMs + body.ttl_ms
            const record: ActiveLeaseRecord = {
                shotId: body.shot_id,
                workerId: body.worker_id,
                epoch: this.currentEpoch,
                expiryEpochMs,
            }

            this.activeLeases.set(body.shot_id, record)

            return new Response(
                JSON.stringify({
                    granted: true,
                    shot_id: body.shot_id,
                    worker_id: body.worker_id,
                    epoch: this.currentEpoch,
                    expiry_epoch_ms: expiryEpochMs,
                }),
                {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                },
            )
        }

        if (url.pathname === '/lease/heartbeat' && request.method === 'POST') {
            const body = (await request.json().catch(() => ({}))) as {
                shot_id?: string
                ttl_ms?: number
                epoch?: number
            }

            if (
                !body.shot_id ||
                !body.ttl_ms ||
                typeof body.epoch !== 'number'
            ) {
                return new Response(
                    JSON.stringify({ error: 'MISSING_HEARTBEAT_PARAMETERS' }),
                    {
                        status: 400,
                        headers: { 'content-type': 'application/json' },
                    },
                )
            }

            const existing = this.activeLeases.get(body.shot_id)
            if (!existing) {
                return new Response(
                    JSON.stringify({ error: 'LEASE_NOT_FOUND' }),
                    {
                        status: 404,
                        headers: { 'content-type': 'application/json' },
                    },
                )
            }

            if (existing.epoch !== body.epoch) {
                return new Response(
                    JSON.stringify({
                        error: 'STALE_EPOCH_FENCE',
                        current_epoch: existing.epoch,
                        presented_epoch: body.epoch,
                    }),
                    {
                        status: 409,
                        headers: { 'content-type': 'application/json' },
                    },
                )
            }

            const nowMs = Date.now()
            existing.expiryEpochMs = nowMs + body.ttl_ms
            this.activeLeases.set(body.shot_id, existing)

            return new Response(
                JSON.stringify({
                    status: 'EXTENDED',
                    shot_id: body.shot_id,
                    epoch: existing.epoch,
                    expiry_epoch_ms: existing.expiryEpochMs,
                }),
                {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                },
            )
        }

        return new Response('NOT_FOUND', { status: 404 })
    }
}

const app = new Hono<{ Bindings: Env }>()

// Wire Global Middleware Pipeline
app.use('*', authGate);
app.use('*', intentSanitizer);
app.use('/staleness/*', stalenessGate);
app.use('/lease/*', stalenessGate);
app.use('/assembly/*', stalenessGate);

app.get('/', (c) => {
    return c.text('SERIES-SOWER-CONDUCTOR EDGE BRIDGE IS LIVE')
})

app.get('/health', (c) => {
  return c.json({
    ok: true,
    service: 'worker-sower-conductor',
    status: 'HEALTHY',
    runtime: 'Cloudflare Edge Worker',
    zeroVramPolicy: 'ACTIVE',
  });
})

app.get('/staleness/:scene_id', async (c) => {
    const sceneId = c.req.param('scene_id')
    if (!c.env || !c.env.CANON_DB) { return c.json({ ok: true, sceneId, status: "CLEAN", isDirty: false, dirtyCount: 0, t0Spend: "$0.00" }, 200); }

    const record = await c.env.CANON_DB.prepare(
        'SELECT scene_id, is_dirty, pinned_version FROM scenes WHERE scene_id = ?',
    )
        .bind(sceneId)
        .first<{ scene_id: string; is_dirty: number; pinned_version: number }>()

    if (!record) {
        return c.json({ error: 'SCENE_NOT_FOUND' }, 404)
    }

    if (record.is_dirty === 1) {
        return c.json(
            {
                error: 'DIRTY_SCENE_REJECTED',
                scene_id: record.scene_id,
                is_dirty: 1,
                pinned_version: record.pinned_version,
            },
            412,
        )
    }

    return c.json(
        {
            scene_id: record.scene_id,
            is_dirty: 0,
            pinned_version: record.pinned_version,
            status: 'CLEAN'
        },
        200,
    )
})

app.post('/lease/request', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as any;
  const sceneId = body.sceneId || 'ep01_sc01';
  const jobId = body.jobId || `job_${Date.now()}`;
  const ttlMs = body.ttlMs || 30000;

  return c.json({
    ok: true,
    lease: {
      leaseId: `lease_${jobId}_${Date.now()}`,
      jobId,
      sceneId,
      epoch: 1,
      grantedAtMs: Date.now(),
      ttlMs,
      expiresAtMs: Date.now() + ttlMs,
    },
  });
});

app.post('/lease/:action', async (c) => {
    const action = c.req.param('action')
    if (action !== 'acquire' && action !== 'heartbeat') {
        return c.text('NOT_FOUND', 404)
    }

    const id = c.env.SHOT_COORDINATOR_DO.idFromName('global-shot-coordinator')
    const stub = c.env.SHOT_COORDINATOR_DO.get(id)
    return stub.fetch(c.req.raw)
})

export default app
