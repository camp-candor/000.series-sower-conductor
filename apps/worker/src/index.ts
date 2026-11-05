import { Hono } from 'hono'
import { ShotCoordinatorDO } from './objects/ShotCoordinatorDO.js'

export { ShotCoordinatorDO }
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



app.all('/lease/*', async (c) => {
    const id = c.env.SHOT_COORDINATOR_DO.idFromName('global_shot_coordinator')
    const stub = c.env.SHOT_COORDINATOR_DO.get(id)
    return stub.fetch(c.req.raw)
})

export default app
