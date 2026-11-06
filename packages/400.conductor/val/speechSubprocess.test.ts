import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SpeechModel } from '../09.speech.unit/speech.model.js'
import * as Buzz from '../09.speech.unit/buz/speech.buzz.js'
import { DialogueSynthesisItem } from '../09.speech.unit/fce/speech.interface.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('09.speech.unit: Native Speech Synthesis Subprocess Invocation Watcher', () => {
    let model: SpeechModel
    const testOutputDir = path.resolve('public/audio/dialogue/test_scratch')

    beforeEach(() => {
        model = new SpeechModel()
        if (!fs.existsSync(testOutputDir)) {
            fs.mkdirSync(testOutputDir, { recursive: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true })
        }
        vi.restoreAllMocks()
    })

    const baseItem: DialogueSynthesisItem = {
        line_id: 'line_001',
        speaker_id: 'char_elias',
        dialogue_text: 'The intake valve is rusted through.',
        emotion_tag: 'tense_jaw',
        tonePacing: 1.0,
        dsp_modifiers: {
            effective_pitch_semitones: -1.5,
            effective_formant_warping: 0.85,
            effective_breathiness_multiplier: 1.4,
            pause_frequency_multiplier: 1.2,
            effective_vocal_fry_density: 0.35,
            target_lufs: -16.0,
            peak_dbtp: -1.0,
            banned_cadences: [],
        },
    }

    it('buildCliArgs correctly maps all somatic DSP modifiers and engine arguments', () => {
        const args = Buzz.buildCliArgs(
            'synthesize.py',
            baseItem,
            'test.tmp',
            'styletts2',
            'floorboards',
        )
        expect(args).toContain('--engine')
        expect(args).toContain('styletts2')
        expect(args).toContain('--character')
        expect(args).toContain('char_elias')
        expect(args).toContain('--pitch-shift')
        expect(args).toContain('-1.5')
        expect(args).toContain('--formant-warp')
        expect(args).toContain('0.85')
        expect(args).toContain('--breathiness')
        expect(args).toContain('1.4')
        expect(args).toContain('--vocal-fry')
        expect(args).toContain('0.35')
    })

    it('verifyZeroByteSentinel rejects missing files, files < 1024 bytes, and invalid RIFF headers', () => {
        const nonExistent = path.join(testOutputDir, 'missing.wav')
        expect(Buzz.verifyZeroByteSentinel(nonExistent)).toBe(false)

        const smallFile = path.join(testOutputDir, 'small.wav')
        fs.writeFileSync(smallFile, Buffer.alloc(500))
        expect(Buzz.verifyZeroByteSentinel(smallFile)).toBe(false)

        const corruptHeader = path.join(testOutputDir, 'corrupt.wav')
        const corruptBuffer = Buffer.alloc(2048)
        corruptBuffer.write('FAIL', 0, 'ascii')
        fs.writeFileSync(corruptHeader, corruptBuffer)
        expect(Buzz.verifyZeroByteSentinel(corruptHeader)).toBe(false)

        const validHeader = path.join(testOutputDir, 'valid.wav')
        const validBuffer = Buffer.alloc(2048)
        validBuffer.write('RIFF', 0, 'ascii')
        validBuffer.write('WAVE', 8, 'ascii')
        fs.writeFileSync(validHeader, validBuffer)
        expect(Buzz.verifyZeroByteSentinel(validHeader)).toBe(true)
    })

    it('pollFileStabilization successfully confirms byte-size stabilization', async () => {
        const stagingFile = path.join(testOutputDir, 'polling_test.wav.tmp')
        fs.writeFileSync(stagingFile, Buffer.alloc(1500))

        const confirmedSize = await Buzz.pollFileStabilization(
            stagingFile,
            2000,
            50,
        )
        expect(confirmedSize).toBe(1500)
    })

    it('pollFileStabilization throws SYNTHESIS_TIMEOUT_BREACH if file does not appear', async () => {
        const nonExistent = path.join(testOutputDir, 'ghost.wav.tmp')
        await expect(
            Buzz.pollFileStabilization(nonExistent, 150, 50),
        ).rejects.toThrow(/SYNTHESIS_TIMEOUT_BREACH/)
    })
})
