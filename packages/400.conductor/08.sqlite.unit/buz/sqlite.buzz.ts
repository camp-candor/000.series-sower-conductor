import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { SqliteModel } from '../sqlite.model.js'
import SqliteBit from '../fce/sqlite.bit.js'
import State from '../../99.core/state.js'

let dbInstance: Database.Database | null = null

export const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS facts (
    fact_id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content_json TEXT NOT NULL,
    merkle_leaf_hash TEXT NOT NULL CHECK(length(merkle_leaf_hash) = 64),
    updated_at_ms INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scenes (
    scene_id TEXT PRIMARY KEY,
    pinned_version INTEGER NOT NULL,
    is_dirty INTEGER NOT NULL CHECK(is_dirty IN (0, 1)) DEFAULT 0,
    state_snapshot_hash TEXT NOT NULL CHECK(length(state_snapshot_hash) = 64),
    updated_at_ms INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scene_fact_dependencies (
    scene_id TEXT NOT NULL,
    fact_id TEXT NOT NULL,
    pinned_fact_version INTEGER NOT NULL,
    PRIMARY KEY (scene_id, fact_id),
    FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE CASCADE,
    FOREIGN KEY (fact_id) REFERENCES facts(fact_id) ON DELETE RESTRICT
  );

  CREATE TRIGGER IF NOT EXISTS trg_fact_version_bump
  AFTER UPDATE ON facts
  WHEN NEW.version > OLD.version
  BEGIN
    UPDATE scenes
    SET is_dirty = 1,
        updated_at_ms = NEW.updated_at_ms
    WHERE scene_id IN (
      SELECT scene_id FROM scene_fact_dependencies WHERE fact_id = NEW.fact_id
    );
  END;

  CREATE TABLE IF NOT EXISTS entities_live (
    entity_id TEXT PRIMARY KEY,
    location_id TEXT NOT NULL,
    coord_q INTEGER NOT NULL DEFAULT 0,
    coord_r INTEGER NOT NULL DEFAULT 0,
    fatigue_bps INTEGER NOT NULL CHECK(fatigue_bps BETWEEN 0 AND 10000) DEFAULT 0,
    pain_bps INTEGER NOT NULL CHECK(pain_bps BETWEEN 0 AND 10000) DEFAULT 0,
    refusal_strain_bps INTEGER NOT NULL CHECK(refusal_strain_bps BETWEEN 0 AND 10000) DEFAULT 0,
    locomotion_tier TEXT NOT NULL CHECK(locomotion_tier IN ('UNRESTRICTED', 'LIMPING', 'IMMOBILIZED')) DEFAULT 'UNRESTRICTED',
    banned_kinetic_verbs_json TEXT NOT NULL DEFAULT '[]',
    updated_at_ms INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS strings_ledger (
    relation_id TEXT PRIMARY KEY,
    holder_id TEXT NOT NULL,
    debtor_id TEXT NOT NULL,
    weight_bps INTEGER NOT NULL CHECK(weight_bps BETWEEN 0 AND 10000),
    strings_count INTEGER NOT NULL CHECK(strings_count >= 0) DEFAULT 1,
    updated_at_ms INTEGER NOT NULL,
    CHECK(holder_id != debtor_id)
  );

  CREATE TABLE IF NOT EXISTS grievance_status (
    grievance_id TEXT PRIMARY KEY,
    instigator_id TEXT NOT NULL,
    victim_id TEXT NOT NULL,
    escalation_depth INTEGER NOT NULL CHECK(escalation_depth >= 0) DEFAULT 0,
    cooldown_cycles INTEGER NOT NULL CHECK(cooldown_cycles >= 0) DEFAULT 0,
    intensity_bps INTEGER NOT NULL CHECK(intensity_bps BETWEEN 0 AND 10000) DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('DORMANT', 'ACTIVE', 'SIMMERING', 'RESOLVED')) DEFAULT 'DORMANT',
    updated_at_ms INTEGER NOT NULL,
    CHECK(instigator_id != victim_id)
  );

  CREATE TABLE IF NOT EXISTS paranoia_clocks (
    clock_id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    clock_name TEXT NOT NULL,
    value_bps INTEGER NOT NULL CHECK(value_bps BETWEEN 0 AND 10000) DEFAULT 0,
    threshold_bps INTEGER NOT NULL CHECK(threshold_bps BETWEEN 0 AND 10000) DEFAULT 10000,
    decay_rate_bps INTEGER NOT NULL CHECK(decay_rate_bps BETWEEN 0 AND 10000) DEFAULT 0,
    is_triggered INTEGER NOT NULL CHECK(is_triggered IN (0, 1)) DEFAULT 0,
    updated_at_ms INTEGER NOT NULL,
    UNIQUE(entity_id, clock_name)
  );

  CREATE TABLE IF NOT EXISTS event_log (
    sequence_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    stream_id TEXT NOT NULL,
    tick INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    actor_id TEXT,
    target_id TEXT,
    seed TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    state_hash TEXT NOT NULL CHECK(length(state_hash) = 64),
    timestamp_ms INTEGER NOT NULL
  );

  CREATE TRIGGER IF NOT EXISTS trg_event_log_no_update
  BEFORE UPDATE ON event_log
  BEGIN
    SELECT RAISE(ABORT, 'IMMUTABILITY_VIOLATION: Updates strictly prohibited on event_log');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_event_log_no_delete
  BEFORE DELETE ON event_log
  BEGIN
    SELECT RAISE(ABORT, 'IMMUTABILITY_VIOLATION: Deletions strictly prohibited on event_log');
  END;
`

export const getSqliteInstance = (): Database.Database => {
    if (!dbInstance) {
        throw new Error(
            'DATABASE_NOT_INITIALIZED: Invoke openSqliteLedger first.',
        )
    }
    return dbInstance
}

export const initSqlite = (cpy: SqliteModel, bal: SqliteBit, _ste?: State) => {
    if (bal.slv) bal.slv({ sqliteBit: { idx: 'init-sqlite', val: 1 } })
    return cpy
}

export const openSqliteLedger = (
    cpy: SqliteModel,
    bal: SqliteBit,
    _ste?: State,
) => {
    const targetPath = bal.src || cpy.dbPath || 'data/sqlite/pilot.db'

    if (targetPath !== ':memory:') {
        const resolvedPath = path.resolve(process.cwd(), targetPath)
        const dir = path.dirname(resolvedPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    }

    if (!dbInstance || cpy.dbPath !== targetPath) {
        if (dbInstance) {
            dbInstance.close()
        }
        dbInstance = new Database(
            targetPath === ':memory:'
                ? ':memory:'
                : path.resolve(process.cwd(), targetPath),
        )
        dbInstance.pragma('foreign_keys = ON')
        if (targetPath !== ':memory:') {
            dbInstance.pragma('journal_mode = WAL')
            dbInstance.pragma('synchronous = NORMAL')
        }
        dbInstance.exec(SCHEMA_DDL)
    }

    const integrityRow = dbInstance.pragma('integrity_check') as Array<{
        integrity_check: string
    }>
    const integrity = integrityRow[0]?.integrity_check || 'ok'

    const tables = dbInstance
        .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        )
        .all() as Array<{ name: string }>

    cpy.dbPath = targetPath
    cpy.isOpen = true
    cpy.tableCount = tables.length
    cpy.integrity = integrity

    process.stdout.write(
        `>> [SQLITE] [OK] Local SQLite ledger opened: ${targetPath} (${tables.length} tables, integrity: ${integrity})\n`,
    )

    if (bal.slv) {
        bal.slv({
            sqliteBit: {
                idx: 'open-sqlite-ledger',
                val: 1,
                src: targetPath,
                dat: dbInstance,
            },
        })
    }
    return cpy
}

export const closeSqliteLedger = (
    cpy: SqliteModel,
    bal: SqliteBit,
    _ste?: State,
) => {
    if (dbInstance) {
        dbInstance.close()
        dbInstance = null
    }
    cpy.isOpen = false
    process.stdout.write('>> [SQLITE] [OK] Local SQLite connection closed.\n')

    if (bal.slv) {
        bal.slv({
            sqliteBit: {
                idx: 'close-sqlite-ledger',
                val: 1,
            },
        })
    }
    return cpy
}
