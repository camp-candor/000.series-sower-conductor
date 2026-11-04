import { Context, Next } from 'hono';

export async function stalenessGate(c: Context, next: Next) {
  const startTime = Date.now();
  const db = (c.env as any)?.CANON_DB;

  // Extract target scene ID from path parameter, query parameter, or JSON body
  let sceneId = c.req.param('scene_id');

  if (!sceneId) {
    const url = new URL(c.req.url);
    sceneId = url.searchParams.get('scene_id') || undefined;
  }

  if (!sceneId && c.req.method === 'POST') {
    try {
      const cloned = c.req.raw.clone();
      const body = await cloned.json();
      sceneId = (body as any)?.sceneId || (body as any)?.scene_id;
    } catch {
      // Body may not be JSON; continue
    }
  }

  // If no scene context is targeted, pass through
  if (!sceneId) {
    return next();
  }

  // If CANON_DB is not bound (pure mock mode), pass through safely
  if (!db || typeof db.prepare !== 'function') {
    return next();
  }

  try {
    const stmt = db.prepare(
      'SELECT COUNT(*) AS dirty_count FROM scene_fact_dependencies WHERE scene_id = ? AND is_dirty = 1;'
    );
    const row = await stmt.bind(sceneId).first();
    const dirtyCount = Number(row?.dirty_count ?? 0);

    const latencyMs = Date.now() - startTime;
    c.header('X-Continuity-Latency-Ms', latencyMs.toString());

    if (dirtyCount > 0) {
      // Precondition Failed: Halt at T0 = $0.00
      return c.json(
        {
          ok: false,
          error: {
            code: 'DIRTY_SCENE_REJECTED',
            message: `Precondition failed: Scene ${sceneId} has ${dirtyCount} unratified dirty dependencies.`,
            sceneId,
            dirtyCount,
            t0Spend: '$0.00',
          },
        },
        412
      );
    }

    return next();
  } catch (err: any) {
    // If table does not exist in local dev, allow passthrough with warning
    c.header('X-Continuity-Warning', `Query skipped: ${err.message}`);
    return next();
  }
}
