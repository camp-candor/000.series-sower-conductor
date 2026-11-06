import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import {
    verifyNonSilentWavPcm,
    synthesizeSingleLineWithRetry
} from '../09.speech.unit/buz/speech.buzz.js'
import { DialogueSynthesisItem } from '../09.speech.unit/fce/speech.interface.js'

describe('Feature 2.1: Parallax Speech Bridge', () => {
    const testOutputDir = path.resolve('outputs/test_stems')

    beforeAll(() => {
        if (!fs.existsSync(testOutputDir)) {
            fs.mkdirSync(testOutputDir, { recursive: true })
        }
    })

    afterAll(() => {
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true })
        }
    })

    it('synthesizes Johnny and Orbie lines producing non-silent WAVs', async () => {
        const johnnyItem: DialogueSynthesisItem = {
            line_id: 'johnny_01',
            speaker_id: 'char_johnny_walkman',
            dialogue_text: 'Miss Beverly, do you copy?',
            emotion_tag: 'NEUTRAL',
            dsp_modifiers: {
                effective_pitch_semitones: 0,
                effective_formant_warping: 1,
                effective_breathiness_multiplier: 1,
                pause_frequency_multiplier: 1,
                effective_vocal_fry_density: 0,
                target_lufs: -16,
                peak_dbtp: -1,
                banned_cadences: []
            }
        }

        const orbieItem: DialogueSynthesisItem = {
            line_id: 'orbie_01',
            speaker_id: 'char_orbie_mayhaw',
            dialogue_text: 'I copy, Walkman.',
            emotion_tag: 'NEUTRAL',
            dsp_modifiers: {
                effective_pitch_semitones: 0,
                effective_formant_warping: 1,
                effective_breathiness_multiplier: 1,
                pause_frequency_multiplier: 1,
                effective_vocal_fry_density: 0,
                target_lufs: -16,
                peak_dbtp: -1,
                banned_cadences: []
            }
        }

        const johnnyReceipt = await synthesizeSingleLineWithRetry(johnnyItem, testOutputDir, 'styletts2', 'test_series', 'sc_01')
        expect(johnnyReceipt.ok).toBe(true)

        const johnnyWavStats = verifyNonSilentWavPcm(johnnyReceipt.target_path)
        expect(johnnyWavStats.ok).toBe(true)
        expect(johnnyWavStats.rms).toBeGreaterThan(50)

        const orbieReceipt = await synthesizeSingleLineWithRetry(orbieItem, testOutputDir, 'styletts2', 'test_series', 'sc_01')
        expect(orbieReceipt.ok).toBe(true)

        const orbieWavStats = verifyNonSilentWavPcm(orbieReceipt.target_path)
        expect(orbieWavStats.ok).toBe(true)
        expect(orbieWavStats.rms).toBeGreaterThan(50)
    })

    it('produces distinct SHA-256 digests on DSP modification, identical on identical inputs', async () => {
        const baseItem: DialogueSynthesisItem = {
            line_id: 'base_01',
            speaker_id: 'char_johnny_walkman',
            dialogue_text: 'Test DSP shift.',
            emotion_tag: 'NEUTRAL',
            dsp_modifiers: {
                effective_pitch_semitones: 0,
                effective_formant_warping: 1,
                effective_breathiness_multiplier: 1,
                pause_frequency_multiplier: 1,
                effective_vocal_fry_density: 0,
                target_lufs: -16,
                peak_dbtp: -1,
                banned_cadences: []
            }
        }

        const baseReceipt1 = await synthesizeSingleLineWithRetry(baseItem, testOutputDir, 'styletts2', 'test_series', 'sc_01')
        const baseReceipt2 = await synthesizeSingleLineWithRetry({...baseItem, line_id: 'base_02'}, testOutputDir, 'styletts2', 'test_series', 'sc_01')

        expect(baseReceipt1.sha256).toBe(baseReceipt2.sha256)

        const modItem: DialogueSynthesisItem = {
            ...baseItem,
            line_id: 'mod_01',
            dsp_modifiers: {
                ...baseItem.dsp_modifiers!,
                effective_pitch_semitones: 2
            }
        }

        const modReceipt = await synthesizeSingleLineWithRetry(modItem, testOutputDir, 'styletts2', 'test_series', 'sc_01')

        expect(modReceipt.sha256).not.toBe(baseReceipt1.sha256)
    })

    it('rejects zero-filled WAV buffers as a negative control', () => {
        const dummyPath = path.resolve(testOutputDir, 'dummy_silence.wav')

        const totalSize = 144044
        const dataSize = totalSize - 44
        const header = Buffer.alloc(44)
        header.write('RIFF', 0)
        header.writeUInt32LE(totalSize - 8, 4)
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
        header.writeUInt32LE(dataSize, 40)

        const silence = Buffer.alloc(dataSize, 0)
        fs.writeFileSync(dummyPath, Buffer.concat([header, silence]))

        const res = verifyNonSilentWavPcm(dummyPath)
        expect(res.ok).toBe(false)
        expect(res.rms).toBe(0)
    })
})
