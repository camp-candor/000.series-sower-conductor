// packages/400.conductor/val/exposureSheet.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AudioModel } from '../32.audio.unit/audio.model.js'
import * as Buzz from '../32.audio.unit/buz/audio.buzz.js'
import * as Duck from '../32.audio.unit/buz/duckingCalculator.buzz.js'
import * as Foley from '../32.audio.unit/buz/foleySeeder.buzz.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('32.audio.unit: Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation', () => {
    let model: AudioModel
    const draftsDir = path.resolve('drafts')

    beforeEach(() => {
        model = new AudioModel()
        if (!fs.existsSync(draftsDir)) {
            fs.mkdirSync(draftsDir, { recursive: true })
        }
    })

    afterEach(() => {
        const finalPath = path.join(draftsDir, 'exposure_sheet.json')
        const stagingPath = `${finalPath}.tmp`
        if (fs.existsSync(finalPath)) {
            try {
                fs.unlinkSync(finalPath)
            } catch {}
        }
        if (fs.existsSync(stagingPath)) {
            try {
                fs.unlinkSync(stagingPath)
            } catch {}
        }
    })

    it('calculates -14.0 dB ducked volume floor accurately from base volume', () => {
        const base = 0.4
        const ducked = Duck.calculateDuckedVolume(base, -14.0)
        // 0.40 * 10^(-14/20) = 0.40 * 0.199526 = 0.0798
        expect(ducked).toBe(0.0798)
    })

    it('enforces multi-window minimum reduction preventing volume surge during 8-frame conversational pause', () => {
        const windows = [
            {
                shot_id: 'sh01',
                from_frame: 10,
                to_frame: 40,
                stem_path: 'a.wav',
                speaker_id: 'bog',
            },
            {
                shot_id: 'sh02',
                from_frame: 48,
                to_frame: 80,
                stem_path: 'b.wav',
                speaker_id: 'elias',
            }, // 8-frame pause (frames 41-47)
        ]

        const curve = Duck.computeMultiWindowDuckingCurve(windows, 100, 0.4)
        expect(curve.length).toBe(100)

        // Baseline before attack
        expect(curve[0].gain).toBe(0.4)

        // Active dialogue window 1
        expect(curve[20].gain).toBe(0.0798)

        // Mid-pause frame 44: combined attack/release is 18 frames, gap is 8 frames -> clamped flat near/at floor
        expect(curve[44].gain).toBeLessThan(0.15)

        // Active dialogue window 2
        expect(curve[60].gain).toBe(0.0798)

        // Fully recovered after release
        expect(curve[95].gain).toBe(0.4)
    })

    it('seeds deterministic foley transients using MurmurHash3', () => {
        const samples = [
            'footstep_01.wav',
            'footstep_02.wav',
            'footstep_03.wav',
        ]
        const cueA = Foley.resolveDeterministicFoleyCue(
            'sc01',
            'sh01',
            'footstep',
            14,
            samples,
        )
        const cueB = Foley.resolveDeterministicFoleyCue(
            'sc01',
            'sh01',
            'footstep',
            14,
            samples,
        )
        const cueC = Foley.resolveDeterministicFoleyCue(
            'sc01',
            'sh02',
            'footstep',
            14,
            samples,
        )

        expect(cueA.resolved_sample).toBe(cueB.resolved_sample)
        expect(cueA.frame_offset).toBe(14)
        expect(typeof cueA.resolved_sample).toBe('string')
    })

    it('assembles exposure sheet document and performs atomic POSIX commit to drafts/exposure_sheet.json', async () => {
        const bale = {
            idx: 'test-assemble',
            dat: {
                scene_id: 'ep01_sc01',
                series_id: 'under-the-floorboards',
                dialogue_windows: [
                    {
                        shot_id: 'sh01',
                        from_frame: 0,
                        to_frame: 74,
                        stem_path: 'dialogue/sh01.wav',
                        speaker_id: 'bog',
                    },
                ],
                foley_cues: [
                    {
                        shot_id: 'sh01',
                        frame_offset: 10,
                        cue_name: 'boot_scrape',
                        resolved_sample: 'boot_01.wav',
                        volume: 0.8,
                    },
                ],
            },
            slv: (res: any) => res,
        }

        const updated = await Buzz.assembleAcousticExposureSheet(
            model,
            bale,
            null as any,
        )
        expect(updated.lastReceipt?.ok).toBe(true)

        const committedFile = path.join(draftsDir, 'exposure_sheet.json')
        expect(fs.existsSync(committedFile)).toBe(true)

        const raw = fs.readFileSync(committedFile, 'utf8')
        const parsed = JSON.parse(raw)
        expect(parsed.scene_id).toBe('ep01_sc01')
        expect(parsed.tracks.track1_dialogue.length).toBe(1)
        expect(parsed.tracks.track2_foley.length).toBe(1)
        expect(parsed.tracks.track3_ambient.ducking_keyframes.length).toBe(75)
    })
})
