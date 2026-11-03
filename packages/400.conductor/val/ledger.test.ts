import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import sim from '../hunt.js'
import * as ActSqlite from '../08.sqlite.unit/sqlite.action.js'
import * as ActLedger from '../21.ledger.unit/ledger.action.js'
import { getSqliteInstance } from '../08.sqlite.unit/buz/sqlite.buzz.js'

describe('packages/400.conductor Local SQLite Continuity Ledger (Point 5)', () => {
    beforeEach(async () => {
        await sim.hunt!(ActSqlite.OPEN_SQLITE_LEDGER, { src: ':memory:' })
    })

    afterEach(async () => {
        await sim.hunt!(ActSqlite.CLOSE_SQLITE_LEDGER, {})
    })

    it('LEVEL 1: Blocks self-referential debt in strings_ledger (Anti-Reflexivity Law)', () => {
        const db = getSqliteInstance()
        expect(() => {
            db.prepare(
                `
        INSERT INTO strings_ledger (relation_id, holder_id, debtor_id, weight_bps, strings_count, updated_at_ms)
        VALUES ('actor_a->actor_a', 'actor_a', 'actor_a', 5000, 2, 1000)
      `,
            ).run()
        }).toThrow()
    })

    it('LEVEL 2: Blocks out-of-bounds basis points in entities_live (Gillian Arithmetic)', () => {
        const db = getSqliteInstance()
        expect(() => {
            db.prepare(
                `
        INSERT INTO entities_live (entity_id, location_id, fatigue_bps, updated_at_ms)
        VALUES ('actor_bog', 'loc_hub', 10001, 1000)
      `,
            ).run()
        }).toThrow()
    })

    it('LEVEL 3: Prevents modifications and deletions in event_log (Append-Only Airlock)', () => {
        const db = getSqliteInstance()
        db.prepare(
            `
      INSERT INTO event_log (event_id, stream_id, type, seed, payload_json, prev_hash, state_hash, timestamp_ms)
      VALUES ('evt_1', 'str_main', 'TEST_EVENT', 'seed_1', '{}', '0000000000000000000000000000000000000000000000000000000000000000', '1111111111111111111111111111111111111111111111111111111111111111', 1000)
    `,
        ).run()

        expect(() => {
            db.prepare(
                "UPDATE event_log SET stream_id = 'str_mutated' WHERE event_id = 'evt_1'",
            ).run()
        }).toThrow(/IMMUTABILITY_VIOLATION/)

        expect(() => {
            db.prepare("DELETE FROM event_log WHERE event_id = 'evt_1'").run()
        }).toThrow(/IMMUTABILITY_VIOLATION/)
    })

    it('LEVEL 4: Cascades is_dirty = 1 across dependent scenes when fact version bumps', async () => {
        const db = getSqliteInstance()

        await sim.hunt!(ActLedger.INSERT_FACT, {
            dat: {
                fact_id: 'fact_spoon',
                category: 'LORE',
                version: 1,
                content_json: '{}',
                merkle_leaf_hash:
                    '1111111111111111111111111111111111111111111111111111111111111111',
                updated_at_ms: 1000,
            },
        })

        await sim.hunt!(ActLedger.REGISTER_SCENE_DEPENDENCY, {
            dat: {
                scene_id: 'sc_001',
                fact_id: 'fact_spoon',
                pinned_fact_version: 1,
                pinned_version: 1,
                state_snapshot_hash:
                    '2222222222222222222222222222222222222222222222222222222222222222',
            },
        })

        const preBump = db
            .prepare('SELECT is_dirty FROM scenes WHERE scene_id = ?')
            .get('sc_001') as { is_dirty: number }
        expect(preBump.is_dirty).toBe(0)

        // Bump fact version to trip trigger
        await sim.hunt!(ActLedger.BUMP_FACT_VERSION, {
            dat: {
                fact_id: 'fact_spoon',
                new_version: 2,
                updated_at_ms: 2000,
            },
        })

        const postBump = db
            .prepare('SELECT is_dirty FROM scenes WHERE scene_id = ?')
            .get('sc_001') as { is_dirty: number }
        expect(postBump.is_dirty).toBe(1)
    })
})
