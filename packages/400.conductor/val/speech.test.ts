import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sim from '../hunt.js'
import * as ActSqlite from '../08.sqlite.unit/sqlite.action.js'
import * as ActSpeech from '../09.speech.unit/speech.action.js'
import * as ActConductor from '../00.conductor.unit/conductor.action.js'
import { mapDialogueLineToTTSRequest } from '../09.speech.unit/buz/speech.buzz.js'
import { SceneAST } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

describe('packages/400.conductor 09.speech.unit & Master Lifecycle (Point 11)', () => {
    const testScratchDir = path.resolve(process.cwd(), 'scratch/test_audio')

    const validSceneAst: SceneAST = {
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
                line_id: 'line_001',
                speaker_id: 'char_bog',
                dialogue_clean_ascii: 'Seal the hatch.',
                emotional_tag: 'COLD_RESENTMENT',
                somatic_dsp: {
                    gain_attenuation_bps: 1200,
                    pitch_shift_cents: -50,
                    breathiness_bps: 3400,
                    ducking_depth_db: -14,
                },
                mru_directive: {
                    mru_phase: 'RATIONAL_ACTION',
                    stimulus_id: 'stim_door',
                    intensity_bps: 4500,
                },
            },
        ],
    }

    // Create a minimal 44-byte RIFF WAV buffer for testing
    const createMockWavBuffer = (): Buffer => {
        const buf = Buffer.alloc(144000) // 1 sec at 48k 24b
        buf.write('RIFF', 0, 'ascii')
        buf.writeUInt32LE(buf.length - 8, 4)
        buf.write('WAVE', 8, 'ascii')
        buf.write('fmt ', 12, 'ascii')
        buf.writeUInt32LE(16, 16)
        buf.writeUInt16LE(1, 20)
        buf.writeUInt16LE(1, 22)
        buf.writeUInt32LE(48000, 24)
        buf.writeUInt32LE(144000, 28)
        buf.writeUInt16LE(3, 32)
        buf.writeUInt16LE(24, 34)
        buf.write('data', 36, 'ascii')
        buf.writeUInt32LE(buf.length - 44, 40)
        return buf
    }

    beforeEach(async () => {
        if (!fs.existsSync(testScratchDir)) {
            fs.mkdirSync(testScratchDir, { recursive: true })
        }
        await sim.hunt!(ActSqlite.OPEN_SQLITE_LEDGER, { src: ':memory:' })
    })

    afterEach(async () => {
        await sim.hunt!(ActSqlite.CLOSE_SQLITE_LEDGER, {})
        if (fs.existsSync(testScratchDir)) {
            fs.rmSync(testScratchDir, { recursive: true, force: true })
        }
    })

    it('transforms somatic basis points into deterministic TTS DSP parameters', () => {
        const req = mapDialogueLineToTTSRequest(validSceneAst.lines[0]!)
        expect(req.character).toBe('char_bog')
        expect(req.text).toBe('Seal the hatch.')
        expect(req.dsp_modifiers.basePitchShiftSemitones).toBe(-0.5)
        expect(req.dsp_modifiers.breathinessPauseMultiplier).toBe(1.85)
        expect(req.dsp_modifiers.pause_frequency_multiplier).toBe(1.625)
    })

    it('synthesizes dialogue stems atomically via POST :8000/generate mock', async () => {
        const mockFetch = async () => {
            const wav = createMockWavBuffer()
            return new Response(wav as any, {
                status: 200,
                headers: { 'Content-Type': 'audio/wav' },
            })
        }

        const res = await sim.hunt!(ActSpeech.SYNTHESIZE_SCENE_AUDIO, {
            src: 'http://127.0.0.1:8000',
            dat: {
                ast: validSceneAst,
                outputDir: 'scratch/test_audio',
                fetchFn: mockFetch,
            },
        })

        expect(res).toBeDefined()
        expect(res.speechBit.val).toBe(1)
        expect(res.speechBit.dat.totalLines).toBe(1)

        const stemFile = res.speechBit.dat.stems[0].filePath
        expect(fs.existsSync(stemFile)).toBe(true)
        expect(stemFile.endsWith('.tmp')).toBe(false)
    })

    it('per-line retry recovers after transient network error', async () => {
        let callCount = 0
        const transientFetch = async () => {
            callCount++
            if (callCount < 2) {
                return new Response('Transient network error', { status: 503 })
            }
            return new Response(createMockWavBuffer() as any, { status: 200 })
        }

        const res = await sim.hunt!(ActSpeech.SYNTHESIZE_LINE_AUDIO, {
            src: 'http://127.0.0.1:8000',
            dat: {
                line: validSceneAst.lines[0],
                outputDir: 'scratch/test_audio',
                fetchFn: transientFetch,
            },
        })

        expect(res.speechBit.val).toBe(1)
        expect(callCount).toBe(2)
    })

    it('master lifecycle engine executes end-to-end when all pre-flight gates pass', async () => {
        const mockFetch = async () =>
            new Response(createMockWavBuffer() as any, { status: 200 })

        const res = await sim.hunt!(ActConductor.RUN_SCENE_LIFECYCLE, {
            src: 'drafts/test.json',
            dat: {
                astPayload: validSceneAst,
                bypassNetworkCheck: true,
                outputDir: 'scratch/test_audio',
                fetchFn: mockFetch,
                sampleFn: () => ({
                    freeMb: 21500,
                    totalMb: 24576,
                    usedMb: 3076,
                }),
            },
        })

        expect(res).toBeDefined()
        expect(res.conductorBit.val).toBe(1)
        expect(res.conductorBit.dat.stems.length).toBe(1)
    })

    it('negative control: master lifecycle short-circuits at T0 = $0.00 if continuity gate fails', async () => {
        const db = (
            await sim.hunt!(ActSqlite.OPEN_SQLITE_LEDGER, { src: ':memory:' })
        ).sqliteBit.dat

        // Mark scene as dirty
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES ('ep01_sc01', 1, 1, '1111111111111111111111111111111111111111111111111111111111111111', 1000)
    `,
        ).run()

        let fetchInvoked = false
        const mockFetch = async () => {
            fetchInvoked = true
            return new Response(createMockWavBuffer() as any, { status: 200 })
        }

        const res = await sim.hunt!(ActConductor.RUN_SCENE_LIFECYCLE, {
            src: 'drafts/test.json',
            dat: {
                astPayload: validSceneAst,
                bypassNetworkCheck: true,
                outputDir: 'scratch/test_audio',
                fetchFn: mockFetch,
                sampleFn: () => ({
                    freeMb: 21500,
                    totalMb: 24576,
                    usedMb: 3076,
                }),
            },
        })

        expect(res.conductorBit.val).toBe(0)
        expect(res.conductorBit.src).toContain('Continuity gate rejected scene')
        expect(fetchInvoked).toBe(false) // Zero compute spend at Port 8000
    })
})
