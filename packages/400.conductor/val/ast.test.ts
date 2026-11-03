import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sim from '../hunt.js'
import * as ActAST from '../34.abstractsyntaxtree.unit/abstractsyntaxtree.action.js'
import { SceneAST } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

describe('packages/400.conductor 34.abstractsyntaxtree.unit Strict Screenplay AST Schema', () => {
    const draftsDir = path.resolve(process.cwd(), 'drafts')
    const sampleAstPath = path.resolve(draftsDir, 'test_dialogue_ast.json')

    const validPayload: SceneAST = {
        scene_id: 'ep01_sc03',
        episode_number: 1,
        sequence_index: 3,
        state_snapshot_hash:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        pinned_fact_version: 4,
        environment_id: 'env_culvert_siphon',
        camera_framing: {
            shot_type: 'MEDIUM_SHOT',
            focal_entity_id: 'char_bog',
            secondary_entity_id: 'char_silas',
        },
        lines: [
            {
                line_id: 'line_001',
                speaker_id: 'char_bog',
                dialogue_clean_ascii: 'Hand me the wedge.',
                emotional_tag: 'COLD_RESENTMENT',
                somatic_dsp: {
                    gain_attenuation_bps: 1200,
                    pitch_shift_cents: -50,
                    breathiness_bps: 3400,
                    ducking_depth_db: -14,
                },
                mru_directive: {
                    mru_phase: 'RATIONAL_ACTION',
                    stimulus_id: 'stim_wrench_slip',
                    intensity_bps: 4500,
                },
            },
        ],
    }

    beforeEach(() => {
        if (!fs.existsSync(draftsDir)) {
            fs.mkdirSync(draftsDir, { recursive: true })
        }
        fs.writeFileSync(sampleAstPath, JSON.stringify(validPayload, null, 2))
    })

    afterEach(() => {
        if (fs.existsSync(sampleAstPath)) fs.unlinkSync(sampleAstPath)
    })

    it('validates and deep-freezes a compliant SceneAST payload via sim.hunt', async () => {
        const res = await sim.hunt!(ActAST.PARSE_SCENE_AST, {
            src: 'drafts/test_dialogue_ast.json',
        })

        expect(res).toBeDefined()
        expect(res.abstractsyntaxtreeBit.val).toBe(1)
        expect(res.abstractsyntaxtreeBit.src).toBe('ep01_sc03')
        expect(Object.isFrozen(res.abstractsyntaxtreeBit.dat)).toBe(true)
        expect(Object.isFrozen(res.abstractsyntaxtreeBit.dat.lines[0])).toBe(
            true,
        )
    })

    it('negative control: rejects un-schemaed/hallucinated properties with SCHEMA_VALIDATION_FAILED', async () => {
        const malformed = {
            ...validPayload,
            creative_notes: 'Bog should sound weary',
            hallucination_score: 0.05,
        }

        const res = await sim.hunt!(ActAST.PARSE_SCENE_AST, {
            dat: { rawPayload: malformed },
        })

        expect(res.abstractsyntaxtreeBit.val).toBe(0)
        expect(res.abstractsyntaxtreeBit.src).toContain(
            'SCHEMA_VALIDATION_FAILED',
        )
        expect(res.abstractsyntaxtreeBit.src).toContain('Unrecognized key')
    })

    it('negative control: rejects non-ASCII or multi-byte unicode characters in dialogue_clean_ascii', async () => {
        const malformed = {
            ...validPayload,
            lines: [
                {
                    ...validPayload.lines[0],
                    dialogue_clean_ascii: 'Hand me the wedge... \uD83D\uDD27',
                },
            ],
        }

        const res = await sim.hunt!(ActAST.PARSE_SCENE_AST, {
            dat: { rawPayload: malformed },
        })

        expect(res.abstractsyntaxtreeBit.val).toBe(0)
        expect(res.abstractsyntaxtreeBit.src).toContain(
            'SCHEMA_VALIDATION_FAILED',
        )
    })

    it('negative control: rejects out-of-bounds or floating-point basis points in somatic_dsp', async () => {
        const malformed = {
            ...validPayload,
            lines: [
                {
                    ...validPayload.lines[0],
                    somatic_dsp: {
                        ...validPayload.lines[0]?.somatic_dsp,
                        gain_attenuation_bps: 10001,
                    },
                },
            ],
        }

        const res = await sim.hunt!(ActAST.PARSE_SCENE_AST, {
            dat: { rawPayload: malformed },
        })

        expect(res.abstractsyntaxtreeBit.val).toBe(0)
        expect(res.abstractsyntaxtreeBit.src).toContain(
            'SCHEMA_VALIDATION_FAILED',
        )
    })

    it('negative control: rejects invalid 64-char state_snapshot_hash format', async () => {
        const malformed = {
            ...validPayload,
            state_snapshot_hash: 'not-a-valid-sha256-hash',
        }

        const res = await sim.hunt!(ActAST.PARSE_SCENE_AST, {
            dat: { rawPayload: malformed },
        })

        expect(res.abstractsyntaxtreeBit.val).toBe(0)
        expect(res.abstractsyntaxtreeBit.src).toContain(
            'SCHEMA_VALIDATION_FAILED',
        )
    })
})
