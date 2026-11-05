import { ContinuityCheckResult } from '../fce/lifecycle.interface.js'

export async function verifyLocalContinuity(
    sceneId: string,
    sqliteDb: any,
): Promise<ContinuityCheckResult> {
    const startTime = Date.now()

    if (!sqliteDb || typeof sqliteDb.prepare !== 'function') {
        // In-memory mock fallback when no SQLite instance is provided
        return {
            clean: true,
            sceneId,
            dirtyCount: 0,
            totalDependencies: 0,
            latencyMs: Date.now() - startTime,
        }
    }

    const query = `
    SELECT 
      s.id AS scene_id,
      s.is_dirty AS scene_dirty,
      COUNT(sfd.fact_id) AS total_dependencies,
      SUM(CASE WHEN f.version > sfd.pinned_version THEN 1 ELSE 0 END) AS dirty_dependencies
    FROM scenes s
    LEFT JOIN scene_fact_dependencies sfd ON s.id = sfd.scene_id
    LEFT JOIN facts f ON sfd.fact_id = f.id
    WHERE s.id = ?
    GROUP BY s.id;
  `

    try {
        const stmt = sqliteDb.prepare(query)
        const row = stmt.get(sceneId)

        if (!row) {
            return {
                clean: false,
                sceneId,
                dirtyCount: 0,
                totalDependencies: 0,
                latencyMs: Date.now() - startTime,
                reason: `SCENE_NOT_FOUND: Scene ${sceneId} not registered in local ledger`,
            }
        }

        const dirtyCount = Number(row.dirty_dependencies) || 0
        const isSceneDirty = Number(row.scene_dirty) === 1
        const isClean = dirtyCount === 0 && !isSceneDirty

        return {
            clean: isClean,
            sceneId,
            dirtyCount: dirtyCount + (isSceneDirty ? 1 : 0),
            totalDependencies: Number(row.total_dependencies) || 0,
            latencyMs: Date.now() - startTime,
            reason: isClean
                ? undefined
                : 'DIRTY_SCENE_REJECTED: Unratified fact deltas exist',
        }
    } catch (err: any) {
        return {
            clean: false,
            sceneId,
            dirtyCount: 1,
            totalDependencies: 0,
            latencyMs: Date.now() - startTime,
            reason: `QUERY_ERROR: ${err.message}`,
        }
    }
}
