import fs from 'node:fs';
import path from 'node:path';

export interface LocalContinuityQueryResult {
  sceneId: string;
  isDirty: boolean;
  dirtyCount: number;
  source: 'SQLITE_PILOT_DB' | 'MEMORY_STUB';
  inspectedAtMs: number;
}

export function queryLocalContinuityStaleness(
  sceneId: string,
  customDbPath?: string
): LocalContinuityQueryResult {
  const inspectedAtMs = Date.now();
  const dbPath = customDbPath || path.resolve(process.cwd(), 'pilot.db');

  if (!fs.existsSync(dbPath)) {
    // If pilot.db is physically absent, fail safe to zero dirty dependencies
    process.stdout.write(`>> [FALLBACK] pilot.db not found at ${dbPath}; assuming zero dirty dependencies.\n`);
    return {
      sceneId,
      isDirty: false,
      dirtyCount: 0,
      source: 'MEMORY_STUB',
      inspectedAtMs,
    };
  }

  try {
    // Dynamically evaluate sqlite if available on system without breaking offline mocks
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });

    const stmt = db.prepare(
      'SELECT COUNT(*) as dirtyCount FROM scene_fact_dependencies WHERE scene_id = ? AND is_dirty = 1'
    );
    const row = stmt.get(sceneId) as { dirtyCount: number } | undefined;
    db.close();

    const dirtyCount = row?.dirtyCount ?? 0;
    const isDirty = dirtyCount > 0;

    process.stdout.write(
      `>> [FALLBACK] [OK] Queried local pilot.db for ${sceneId}: ${dirtyCount} dirty dependencies.\n`
    );

    return {
      sceneId,
      isDirty,
      dirtyCount,
      source: 'SQLITE_PILOT_DB',
      inspectedAtMs,
    };
  } catch (err: any) {
    process.stderr.write(`>> [FALLBACK] [WARN] Local SQLite interrogation error: ${err.message}\n`);
    return {
      sceneId,
      isDirty: false,
      dirtyCount: 0,
      source: 'MEMORY_STUB',
      inspectedAtMs,
    };
  }
}
