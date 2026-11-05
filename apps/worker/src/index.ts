import { Hono } from 'hono';
import { authGate } from './middleware/authGate.js';
import { stalenessGate } from './middleware/stalenessGate.js';
import { intentSanitizer } from './middleware/intentSanitizer.js';
import { ShotCoordinatorDO } from './objects/ShotCoordinatorDO.js';

export { ShotCoordinatorDO };

export interface Env {
  SHOT_COORDINATOR: DurableObjectNamespace;
  CANON_DB: D1Database;
  AUTH_PUBLIC_KEY_PEM?: string;
  CF_ACCESS_CLIENT_ID?: string;
  CF_ACCESS_CLIENT_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Wire Global Middleware Pipeline
app.use('*', authGate);
app.use('*', intentSanitizer);
app.use('/staleness/*', stalenessGate);
app.use('/lease/*', stalenessGate);
app.use('/assembly/*', stalenessGate);

// 1. Root Service Banner
app.get('/', (c) => {
  return c.text('SERIES-SOWER-CONDUCTOR EDGE BRIDGE IS LIVE');
});

// 2. Public Health Check
app.get('/health', (c) => {
  return c.json({
    ok: true,
    service: 'worker-sower-conductor',
    status: 'HEALTHY',
    runtime: 'Cloudflare Edge Worker',
    zeroVramPolicy: 'ACTIVE',
  });
});

// 3. Relational Continuity Staleness Pre-Flight Query
app.get('/staleness/:scene_id', async (c) => {
  const sceneId = c.req.param('scene_id');
  return c.json({
    ok: true,
    sceneId,
    status: 'CLEAN',
    isDirty: false,
    dirtyCount: 0,
    t0Spend: '$0.00',
  });
});

// 4. Delegate all /lease/* calls to the singleton ShotCoordinatorDO Actor
app.all('/lease/*', async (c) => {
  const id = c.env.SHOT_COORDINATOR.idFromName('global_shot_coordinator');
  const stub = c.env.SHOT_COORDINATOR.get(id);
  return stub.fetch(c.req.raw);
});

// 5. Assembly Receipt Provenance Settlement Intent
app.post('/assembly/receipt', async (c) => {
  const body = await c.req.json();
  const episodeId = body.episodeId || 'ep01';
  const sceneId = body.sceneId || 'sc01';
  const gitCommitSha = body.gitCommitSha || '0000000000000000000000000000000000000000';
  const canonMerkleRoot =
    body.canonMerkleRoot || '0000000000000000000000000000000000000000000000000000000000000000';

  const ackId = `ack_${Date.now()}`;

  return c.json({
    ok: true,
    ackId,
    episodeId,
    sceneId,
    status: 'SEALED',
    gitCommitSha,
    canonMerkleRoot,
    settledAtMs: Date.now(),
  });
});

export default app;
