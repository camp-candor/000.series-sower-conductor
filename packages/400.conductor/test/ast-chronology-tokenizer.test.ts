import { describe, it, expect } from 'vitest'
import {
    parseFountainDialogue,
    parseFountainChronology,
} from '../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'
import { compileSeriesSceneAst } from '../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'
import { SceneASTSchema } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

const FOUNTAIN_WITH_HEADERS = `Title: Parallax Dinner
Credit: Test
Author: Test Author
Draft date: 2026-10-31
Contact: Test
Series: wiregrass-basin
Scene: ep01_sc01
Date: 2026-10-31
Start-Time: 21:00
Timecode: 21:00:00:00
Daypart: NIGHT
Timezone: America-Chicago
Era: Present

INT. DINER - NIGHT

JOHNNY
Miss Beverly, do you copy?

ORBIE
I copy, Walkman.
`

describe('SceneAST Chronology Fountain Header Tokenizer', () => {
    it('strips chronology headers from dialogue turns', () => {
        const turns = parseFountainDialogue(FOUNTAIN_WITH_HEADERS)
        expect(turns.length).toBe(2)
        expect(turns[0]?.speaker).toBe('JOHNNY')
        expect(turns[1]?.speaker).toBe('ORBIE')
        const speakers = turns.map((t) => t.speaker)
        expect(speakers).not.toContain('Date:')
        for (const t of turns) {
            expect(t.dialogueText).not.toMatch(/2026-10-31/)
        }
    })

    it('parses fountain chronology headers', () => {
        const headers = parseFountainChronology(FOUNTAIN_WITH_HEADERS)
        expect(headers.date).toBe('2026-10-31')
        expect(headers.startTimeHm).toBe('21:00')
        expect(headers.timecodeSmpte).toBe('21:00:00:00')
        expect(headers.daypart).toBe('NIGHT')
        expect(headers.timezoneLabel).toBe('America-Chicago')
        expect(headers.eraLabel).toBe('Present')
    })

    it('passes legacy SceneAST fixtures lacking chronology', () => {
        const legacy = {
            scene_id: 'ep01_sc01',
            episode_number: 1,
            sequence_index: 0,
            state_snapshot_hash: 'a'.repeat(64),
            pinned_fact_version: 1,
            environment_id: 'env_diner',
            camera_framing: {
                shot_type: 'MEDIUM_SHOT',
                focal_entity_id: 'char_johnny_walkman',
            },
            lines: [
                {
                    line_id: 'line_001',
                    speaker_id: 'char_johnny_walkman',
                    dialogue_clean_ascii: 'Hello.',
                    emotional_tag: 'NEUTRAL',
                    somatic_dsp: {
                        gain_attenuation_bps: 0,
                        pitch_shift_cents: 0,
                        breathiness_bps: 0,
                        ducking_depth_db: -14,
                    },
                    mru_directive: {
                        mru_phase: 'RATIONAL_ACTION',
                        stimulus_id: 'stim_default',
                        intensity_bps: 1000,
                    },
                },
            ],
        }
        expect(() => SceneASTSchema.parse(legacy)).not.toThrow()
    })

    it('rejects malformed date plus start time values', () => {
        expect(() =>
            parseFountainChronology('Date: 31-10-2026\nStart-Time: 21:00\n'),
        ).toThrow()
        expect(() =>
            parseFountainChronology('Date: 2026-10-31\nStart-Time: 25:00\n'),
        ).toThrow()
        expect(() =>
            parseFountainChronology('Date: 2026-10-31\nStart-Time: 99:99\n'),
        ).toThrow()
    })

    it('strips 12-line 300.engine header with zero leakage and extracts chronology', () => {
        const engineHeaderFountain = `Title: Wiregrass Pilot
Credit: Written by
Author: Engine 300
Series: wiregrass-basin
Scene: ep01_sc02
Date: 2026-10-31
Start-Time: 21:15
Timecode: 00:05:00:00
Daypart: NIGHT
Timezone: UTC+00:00
Era: CANON_PRESENT

INT. DINER - NIGHT

JOHNNY
Miss Beverly, do you copy?
`
        const turns = parseFountainDialogue(engineHeaderFountain)
        expect(turns.length).toBe(1)
        expect(turns[0]?.speaker).toBe('JOHNNY')
        for (const t of turns) {
            expect(t.speaker).not.toMatch(/DATE|START-TIME|TIMECODE/i)
            expect(t.dialogueText).not.toMatch(/2026-10-31|21:15|00:05:00:00/)
        }
        const headers = parseFountainChronology(engineHeaderFountain)
        expect(headers.date).toBe('2026-10-31')
        expect(headers.startTimeHm).toBe('21:15')
        expect(headers.timecodeSmpte).toBe('00:05:00:00')
        expect(headers.daypart).toBe('NIGHT')
    })

    it('rejects unknown extra keys inside SceneASTSchema chronology (.strict)', () => {
        const base = compileSeriesSceneAst(FOUNTAIN_WITH_HEADERS, {
            sceneId: 'ep01_sc01',
            skipDiskWrite: true,
        })
        const tampered = {
            ...base,
            chronology: {
                ...base.chronology,
                unexpected_extra_key: 'should-fail',
            },
        }
        expect(() => SceneASTSchema.parse(tampered)).toThrow()
    })

    it('preserves chronology through compileSeriesSceneAst from Fountain and ingress AST', () => {
        const ast = compileSeriesSceneAst(FOUNTAIN_WITH_HEADERS, {
            sceneId: 'ep01_sc01',
            skipDiskWrite: true,
        })
        expect(ast.chronology?.start_date).toBe('2026-10-31')
        expect(ast.chronology?.start_time_hm).toBe('21:00')
        expect(ast.chronology?.timecode_smpte).toBe('21:00:00:00')
        expect(ast.chronology?.daypart).toBe('NIGHT')
        expect(() => SceneASTSchema.parse(ast)).not.toThrow()

        const ingressChronology = {
            calendar_system: 'GREGORIAN_24H' as const,
            start_date: '2026-11-01',
            start_time_hm: '22:30',
            timecode_smpte: '22:30:00:00',
            daypart: 'NIGHT' as const,
            tick_seconds: 60,
            frames_per_second: 24,
        }
        const plainFountain = `INT. DINER - NIGHT\n\nJOHNNY\nMiss Beverly, do you copy?\n`
        const fromIngress = compileSeriesSceneAst(plainFountain, {
            sceneId: 'ep01_sc03',
            skipDiskWrite: true,
            dialogueAst: { chronology: ingressChronology },
        })
        expect(fromIngress.chronology).toEqual(ingressChronology)
        expect(() => SceneASTSchema.parse(fromIngress)).not.toThrow()
    })
})
