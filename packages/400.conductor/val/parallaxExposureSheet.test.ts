import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
    matchActionLinesToFoleyPlacements,
    mergeCloseSpeechWindows,
    compileParallaxExposureSheet,
    PARALLAX_FOLEY_REGISTRY
} from '../32.audio.unit/audio.buzzer.js'

describe('Parallax Exposure Sheet Integration', () => {
    it('matches all 9 Foley cues deterministically from action prose', () => {
        const actionLines = [
            { text: 'A heavy rain squall outside.', frameOffset: 0 },
            { text: 'A diesel idling.', frameOffset: 240 },
            { text: 'The diner door hiss opens.', frameOffset: 480 },
            { text: 'The booth creak as he sits.', frameOffset: 720 },
            { text: 'A laminated menu drop on the table.', frameOffset: 960 },
            { text: 'A thermos coffee pour.', frameOffset: 1200 },
            { text: 'An isopropyl wipe tear open.', frameOffset: 1440 },
            { text: 'A metallic lens click.', frameOffset: 1680 },
            { text: 'A roaring semi pass by.', frameOffset: 1920 }
        ]

        const placements = matchActionLinesToFoleyPlacements('ep01_sc01', actionLines)
        expect(placements).toHaveLength(9)

        const foundCues = placements.map(p => p.cue_name)
        const expected = [
            'rain_squall', 'diesel_idle', 'door_hiss', 'booth_creak',
            'menu_drop', 'coffee_pour', 'wipe_tear', 'lens_click', 'semi_pass'
        ]
        expected.forEach(c => expect(foundCues).toContain(c))
    })

    it('applies :retry1 anti-clustering for identical cues within 120 frames', () => {
        const actionLines = [
            { text: 'A heavy rain squall.', frameOffset: 0 },
            { text: 'Another heavy rain squall.', frameOffset: 60 } // < 120 frames
        ]

        const placements = matchActionLinesToFoleyPlacements('ep01_sc01', actionLines)
        expect(placements).toHaveLength(2)
        expect(placements[0].cue_name).toBe('rain_squall')
        expect(placements[1].cue_name).toBe('rain_squall')

        // Ensure distinct variants
        expect(placements[0].resolved_sample).not.toBe(placements[1].resolved_sample)
    })

    it('merges two speech windows separated by <= 18 frames into a continuous ducking trough', () => {
        const windows = [
            { startFrame: 0, endFrame: 24 },
            { startFrame: 40, endFrame: 64 } // 40 - 24 = 16 (<= 18)
        ]

        const merged = mergeCloseSpeechWindows(windows, 18)
        expect(merged).toHaveLength(1)
        expect(merged[0].startFrame).toBe(0)
        expect(merged[0].endFrame).toBe(64)
    })

    it('compiles Parallax Exposure Sheet and creates expected artifact', () => {
        const doc = compileParallaxExposureSheet('ep01_sc01')

        // 34 dialogue windows
        expect(doc.tracks.track1_dialogue).toHaveLength(34)

        // 9 Foley placements
        expect(doc.tracks.track2_foley).toHaveLength(9)

        const outputPath = path.resolve(process.cwd(), 'outputs/ep01_sc01/exposure_sheet.json')
        expect(fs.existsSync(outputPath)).toBe(true)

        const storedDoc = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
        expect(storedDoc.tracks.track1_dialogue).toHaveLength(34)
        expect(storedDoc.tracks.track2_foley).toHaveLength(9)
    })
})
