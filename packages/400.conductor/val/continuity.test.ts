import { describe, it, expect, beforeAll } from 'vitest'
import sim from '../hunt.js'
import * as ActSqlite from '../08.sqlite.unit/sqlite.action.js'
import * as ActContinuity from '../29.continuity.unit/continuity.action.js'
import { getSqliteInstance } from '../08.sqlite.unit/buz/sqlite.buzz.js'

describe('Continuity Gate Validation', () => {
    beforeAll(async () => {
        await sim.hunt(ActSqlite.OPEN_SQLITE_LEDGER, { src: ':memory:' })
    })

    it('should run benchmark under 5ms', async () => {
        const ast = {
            scene_id: 'ep01_sc01',
            episode_number: 1,
            sequence_index: 0,
            state_snapshot_hash:
                '1111111111111111111111111111111111111111111111111111111111111111',
            pinned_fact_version: 1,
            environment_id: 'env_bunker',
            camera_framing: {
                shot_type: 'CLOSE_UP',
                focal_entity_id: 'char_bog',
            },
            lines: [],
        }
        await sim.hunt(ActContinuity.EVALUATE_CONTINUITY_GATE, { dat: ast })

        const t0 = performance.now()
        for (let i = 0; i < 100; i++) {
            const res = await sim.hunt(ActContinuity.EVALUATE_CONTINUITY_GATE, {
                dat: ast,
            })
            expect(res.continuityBit.val).toBe(1)
        }
        const avgMs = (performance.now() - t0) / 100
        expect(avgMs).toBeLessThan(5)
    })

    it('should reject dirty scene', async () => {
        const db = getSqliteInstance()
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES ('ep01_sc_dirty', 1, 1, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 1000)
    `,
        ).run()
        const ast = {
            scene_id: 'ep01_sc_dirty',
            episode_number: 1,
            sequence_index: 0,
            state_snapshot_hash:
                'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            pinned_fact_version: 1,
            environment_id: 'env_bunker',
            camera_framing: {
                shot_type: 'CLOSE_UP',
                focal_entity_id: 'char_bog',
            },
            lines: [],
        }
        const res = await sim.hunt(ActContinuity.EVALUATE_CONTINUITY_GATE, {
            dat: ast,
        })
        expect(res.continuityBit.val).toBe(0)
        expect(res.continuityBit.src).toBe('DIRTY_SCENE_REJECTED')
    })

    it('should reject on divergent hash', async () => {
        const db = getSqliteInstance()
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES ('ep01_sc_divergent', 1, 0, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 1000)
    `,
        ).run()
        const ast = {
            scene_id: 'ep01_sc_divergent',
            episode_number: 1,
            sequence_index: 0,
            state_snapshot_hash:
                'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
            pinned_fact_version: 1,
            environment_id: 'env_bunker',
            camera_framing: {
                shot_type: 'CLOSE_UP',
                focal_entity_id: 'char_bog',
            },
            lines: [],
        }
        const res = await sim.hunt(ActContinuity.EVALUATE_CONTINUITY_GATE, {
            dat: ast,
        })
        expect(res.continuityBit.val).toBe(0)
        expect(res.continuityBit.src).toBe('STATE_SNAPSHOT_DIVERGENCE')
    })

    it('should automatically register unseen scenes', async () => {
        const db = getSqliteInstance()
        const ast = {
            scene_id: 'ep01_sc_new',
            episode_number: 1,
            sequence_index: 0,
            state_snapshot_hash:
                'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
            pinned_fact_version: 1,
            environment_id: 'env_bunker',
            camera_framing: {
                shot_type: 'CLOSE_UP',
                focal_entity_id: 'char_bog',
            },
            lines: [],
        }
        const res = await sim.hunt(ActContinuity.EVALUATE_CONTINUITY_GATE, {
            dat: ast,
        })
        expect(res.continuityBit.val).toBe(1)
        expect(res.continuityBit.dat.allowed).toBe(true)

        const row = db
            .prepare(
                'SELECT is_dirty, state_snapshot_hash FROM scenes WHERE scene_id = ?',
            )
            .get('ep01_sc_new') as any
        expect(row.is_dirty).toBe(0)
        expect(row.state_snapshot_hash).toBe(ast.state_snapshot_hash)
    })
})
