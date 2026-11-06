import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import {
    verifyNonSilentWavPcm,
    synthesizeSingleLineWithRetry
} from '../09.speech.unit/buz/speech.buzz.js'
import { DialogueSynthesisItem } from '../09.speech.unit/fce/speech.interface.js'

describe('Feature 7.1: Parallax Speech Bridge (Zero-VRAM Somatic Synthesis)', () => {
    const testOutputDir = path.resolve('val/tmp_parallax_bridge')

    beforeAll(() => {
        if (!fs.existsSync(testOutputDir)) {
            fs.mkdirSync(testOutputDir, { recursive: true })
        }
        process.env.CUDA_VISIBLE_DEVICES = ''
        process.env.OMP_NUM_THREADS = '4'
    })

    afterAll(() => {
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true })
        }
    })

    const generateTestItem = (speaker_id: string, text: string, pitch = 0, fry = 0): DialogueSynthesisItem => ({
        line_id: crypto.randomBytes(4).toString('hex'),
        speaker_id,
        dialogue_text: text,
        emotion_tag: 'NEUTRAL',
        dsp_modifiers: {
            effective_pitch_semitones: pitch,
            effective_formant_warping: 1.0,
            effective_breathiness_multiplier: 1.0,
            pause_frequency_multiplier: 1.0,
            effective_vocal_fry_density: fry,
            target_lufs: -16.0,
            peak_dbtp: -1.0,
            banned_cadences: []
        }
    })

    it('synthesizes non-silent valid RIFF/WAVE for Johnny Walkman', async () => {
        const item = generateTestItem('char_johnny_walkman', 'Hello, this is a test.')
        const receipt = await synthesizeSingleLineWithRetry(item, testOutputDir, 'styletts2', 'parallax', 'sc01')

        expect(receipt.ok).toBe(true)
        expect(fs.existsSync(receipt.target_path)).toBe(true)

        const verification = verifyNonSilentWavPcm(receipt.target_path)
        expect(verification.ok).toBe(true)
        expect(verification.rms).toBeGreaterThan(50)
        expect(verification.sampleCount).toBeGreaterThan(0)
    }, 20000)

    it('synthesizes non-silent valid RIFF/WAVE for Orbie Mayhaw', async () => {
        const item = generateTestItem('char_orbie_mayhaw', 'Fascinating hypothesis.')
        const receipt = await synthesizeSingleLineWithRetry(item, testOutputDir, 'styletts2', 'parallax', 'sc01')

        expect(receipt.ok).toBe(true)
        const verification = verifyNonSilentWavPcm(receipt.target_path)
        expect(verification.ok).toBe(true)
        expect(verification.rms).toBeGreaterThan(50)
    }, 20000)

    it('produces distinct SHA-256 for different somatic DSP modifiers', async () => {
        const itemA = generateTestItem('char_johnny_walkman', 'Deterministic text.', 0.0, 0.0)
        const itemB = generateTestItem('char_johnny_walkman', 'Deterministic text.', 1.0, 0.0)
        const itemC = generateTestItem('char_johnny_walkman', 'Deterministic text.', 0.0, 1.0)
        const itemD = generateTestItem('char_johnny_walkman', 'Deterministic text.', 0.0, 0.0)

        const recA = await synthesizeSingleLineWithRetry(itemA, testOutputDir, 'styletts2', 'parallax', 'sc01')
        const recB = await synthesizeSingleLineWithRetry(itemB, testOutputDir, 'styletts2', 'parallax', 'sc01')
        const recC = await synthesizeSingleLineWithRetry(itemC, testOutputDir, 'styletts2', 'parallax', 'sc01')
        const recD = await synthesizeSingleLineWithRetry(itemD, testOutputDir, 'styletts2', 'parallax', 'sc01')

        expect(recA.sha256).not.toEqual(recB.sha256)
        expect(recA.sha256).not.toEqual(recC.sha256)
        expect(recB.sha256).not.toEqual(recC.sha256)
        expect(recA.sha256).toEqual(recD.sha256) // identical inputs
    }, 40000)

    it('rejects a zero-filled WAV file (Negative control)', () => {
        const poisonPath = path.resolve(testOutputDir, 'poison.wav')

        const total_size = 144044
        const data_size = total_size - 44
        const header = Buffer.alloc(44)
        header.write('RIFF', 0)
        header.writeUInt32LE(total_size - 8, 4)
        header.write('WAVE', 8)
        header.write('fmt ', 12)
        header.writeUInt32LE(16, 16)
        header.writeUInt16LE(1, 20)
        header.writeUInt16LE(1, 22)
        header.writeUInt32LE(48000, 24)
        header.writeUInt32LE(96000, 28)
        header.writeUInt16LE(2, 32)
        header.writeUInt16LE(16, 34)
        header.write('data', 36)
        header.writeUInt32LE(data_size, 40)

        const zeros = Buffer.alloc(data_size, 0)
        fs.writeFileSync(poisonPath, Buffer.concat([header, zeros]))

        const verification = verifyNonSilentWavPcm(poisonPath)
        expect(verification.ok).toBe(false)
        expect(verification.rms).toBe(0)
    })
})
