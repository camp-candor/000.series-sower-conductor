import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import sim from '../hunt.js'
import * as ActSqlite from '../08.sqlite.unit/sqlite.action.js'
import * as ActContinuity from '../29.continuity.unit/continuity.action.js'
import { getSqliteInstance } from '../08.sqlite.unit/buz/sqlite.buzz.js'
import { SceneAST } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

describe('packages/400.conductor 29.continuity.unit Pre-Flight Continuity Staleness Gate', () => {
    const sampleAst: SceneAST = {
        scene_id: 'ep01_sc01',
        episode_number: 1,
        sequence_index: 0,
        state_snapshot_hash:
            '1111111111111111111111111111111111111111111111111111111111111111',
        pinned_fact_version: 1,
        environment_id: 'env_bunker',
        camera_framing: { shot_type: 'CLOSE_UP', focal_entity_id: 'char_bog' },
        lines: [
            {
                line_id: 'line_01',
                speaker_id: 'char_bog',
                dialogue_clean_ascii: 'Check the seal.',
                emotional_tag: 'COLD_RESENTMENT',
                somatic_dsp: {
                    gain_attenuation_bps: 0,
                    pitch_shift_cents: 0,
                    breathiness_bps: 0,
                    ducking_depth_db: -14,
                },
                mru_directive: {
                    mru_phase: 'RATIONAL_ACTION',
                    stimulus_id: 'stim_door',
                    intensity_bps: 5000,
                },
            },
        ],
    }

    beforeEach(async () => {
        await sim.hunt!(ActSqlite.OPEN_SQLITE_LEDGER, { src: ':memory:' })
    })

    afterEach(async () => {
        await sim.hunt!(ActSqlite.CLOSE_SQLITE_LEDGER, {})
    })

    it('records new scene into ledger and verifies clean in under 5ms', async () => {
        const res = await sim.hunt!(ActContinuity.EVALUATE_CONTINUITY_GATE, {
            dat: sampleAst,
        })

        expect(res).toBeDefined()
        expect(res.continuityBit.val).toBe(1)
        expect(res.continuityBit.dat.allowed).toBe(true)
        expect(res.continuityBit.dat.is_dirty).toBe(false)
        expect(res.continuityBit.dat.duration_ms).toBeLessThanOrEqual(50)
    })

    it('negative control: trips on dirty scene (is_dirty = 1) with DIRTY_SCENE_REJECTED', async () => {
        const db = getSqliteInstance()

        // Mark scene as dirty in pilot.db
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES ('ep01_sc01', 1, 1, '1111111111111111111111111111111111111111111111111111111111111111', 1000)
    `,
        ).run()

        const res = await sim.hunt!(ActContinuity.EVALUATE_CONTINUITY_GATE, {
            dat: sampleAst,
        })

        expect(res.continuityBit.val).toBe(0)
        expect(res.continuityBit.src).toBe('DIRTY_SCENE_REJECTED')
        expect(res.continuityBit.dat.allowed).toBe(false)
        expect(res.continuityBit.dat.is_dirty).toBe(true)
    })

    it('negative control: trips on state snapshot hash divergence with STATE_SNAPSHOT_DIVERGENCE', async () => {
        const db = getSqliteInstance()

        // Insert record with differing hash
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES ('ep01_sc01', 1, 0, '9999999999999999999999999999999999999999999999999999999999999999', 1000)
    `,
        ).run()

        const res = await sim.hunt!(ActContinuity.EVALUATE_CONTINUITY_GATE, {
            dat: sampleAst,
        })

        expect(res.continuityBit.val).toBe(0)
        expect(res.continuityBit.src).toBe('STATE_SNAPSHOT_DIVERGENCE')
        expect(res.continuityBit.dat.allowed).toBe(false)
    })
})
