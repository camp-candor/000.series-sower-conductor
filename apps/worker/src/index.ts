import { Hono } from 'hono'
import { authGate } from './middleware/authGate.js'
import { stalenessGate } from './middleware/stalenessGate.js'
import { intentSanitizer } from './middleware/intentSanitizer.js'
import { ShotCoordinatorDO } from './objects/ShotCoordinatorDO.js'
import { assemblyRoutes } from './routes/assemblyRoutes.js'

export { ShotCoordinatorDO }

export interface Env {
    SHOT_COORDINATOR: DurableObjectNamespace
    CANON_DB: D1Database
    AUTH_PUBLIC_KEY_PEM?: string
    CF_ACCESS_CLIENT_ID?: string
    CF_ACCESS_CLIENT_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

// 0. WebSocket Upgrade Protocol Guard (Pre-Auth Route Guard: must precede authGate)
app.use('/ws', async (c, next) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text(
            'HTTP 426 Upgrade Required: WebSocket protocol required',
            426,
        )
    }
    return next()
})

app.use('/ws/telemetry', async (c, next) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text(
            'HTTP 426 Upgrade Required: WebSocket protocol required',
            426,
        )
    }
    return next()
})

// 0. WebSocket Upgrade Protocol Guard (Pre-Auth Route Guard: must precede authGate)
app.use('/ws', async (c, next) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text(
            'HTTP 426 Upgrade Required: WebSocket protocol required',
            426,
        )
    }
    return next()
})

app.use('/ws/telemetry', async (c, next) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text(
            'HTTP 426 Upgrade Required: WebSocket protocol required',
            426,
        )
    }
    return next()
})

// Wire Global Middleware Pipeline
app.use('*', authGate)
app.use('*', intentSanitizer)
app.use('/staleness/*', stalenessGate)
app.use('/lease/*', stalenessGate)
app.use('/assembly/*', stalenessGate)

// 1. Root Service Banner
app.get('/', (c) => {
    return c.text('SERIES-SOWER-CONDUCTOR EDGE BRIDGE IS LIVE')
})

// 2. Public Health Check
app.get('/health', (c) => {
    return c.json({
        ok: true,
        service: 'worker-sower-conductor',
        status: 'HEALTHY',
        runtime: 'Cloudflare Edge Worker',
        zeroVramPolicy: 'ACTIVE',
    })
})

// 3. WebSocket Upgrade Handshake Gateway
app.get('/ws', async (c) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text(
            'HTTP 426 Upgrade Required: WebSocket protocol required',
            426,
        )
    }
    const id = c.env.SHOT_COORDINATOR.idFromName('global_shot_coordinator')
    const stub = c.env.SHOT_COORDINATOR.get(id)
    return stub.fetch(c.req.raw)
})

app.get('/ws/telemetry', async (c) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text(
            'HTTP 426 Upgrade Required: WebSocket protocol required',
            426,
        )
    }
    const id = c.env.SHOT_COORDINATOR.idFromName('global_shot_coordinator')
    const stub = c.env.SHOT_COORDINATOR.get(id)
    return stub.fetch(c.req.raw)
})

// 4. Relational Continuity Staleness Pre-Flight Query
app.get('/staleness/:scene_id', async (c) => {
    const sceneId = c.req.param('scene_id')
    return c.json({
        ok: true,
        sceneId,
        status: 'CLEAN',
        isDirty: false,
        dirtyCount: 0,
        t0Spend: '$0.00',
    })
})

// 5. Delegate all /lease/* calls to the singleton ShotCoordinatorDO Actor
app.all('/lease/*', async (c) => {
    const id = c.env.SHOT_COORDINATOR.idFromName('global_shot_coordinator')
    const stub = c.env.SHOT_COORDINATOR.get(id)
    return stub.fetch(c.req.raw)
})

// 6. Mount Assembly Telemetry Sink & Provenance Settlement Router
app.route('/assembly', assemblyRoutes)

export default app
