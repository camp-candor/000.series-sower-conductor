import { describe, it, expect } from 'vitest'
import {
    frameToSmpteTimecode24,
    quantizeShotTimeline,
} from '../24.frame.unit/buz/frame.buzz.js'
import {
    anchorEpisodeChronology,
    advanceEpisodeScene,
} from '../25.episode.unit/buz/episode.buzz.js'
import { EpisodeModel } from '../25.episode.unit/episode.model.js'
import {
    ANCHOR_EPISODE_CHRONOLOGY,
    ADVANCE_EPISODE_SCENE,
} from '../25.episode.unit/episode.action.js'
import CONDUCTOR from '../hunt.js'
import { ExposureSheetDocumentSchema } from '../32.audio.unit/val/audio.val.js'
import { assembleExposureSheetDocument } from '../32.audio.unit/buz/audio.buzz.js'

describe('Episode SMPTE Timecode Frame Anchoring', () => {
    it('formats 24fps SMPTE timecodes deterministically', () => {
        expect(frameToSmpteTimecode24(0)).toBe('00:00:00:00')
        expect(frameToSmpteTimecode24(24)).toBe('00:00:01:00')
        expect(frameToSmpteTimecode24(1440)).toBe('00:01:00:00')
    })

    it('rolls frames past midnight cleanly', () => {
        expect(frameToSmpteTimecode24(2073599)).toBe('23:59:59:23')
        expect(frameToSmpteTimecode24(2073600)).toBe('00:00:00:00')
        expect(frameToSmpteTimecode24(24 * 60, '23:59')).toBe('00:00:00:00')
        expect(() => frameToSmpteTimecode24(-1)).toThrow(/NEGATIVE_FRAME_INDEX/)
    })

    it('offsets timecodes from wall clock start', () => {
        expect(frameToSmpteTimecode24(0, '21:00')).toBe('21:00:00:00')
        expect(frameToSmpteTimecode24(23, '21:00')).toBe('21:00:00:23')
        expect(frameToSmpteTimecode24(24, '21:00')).toBe('21:00:01:00')
        expect(frameToSmpteTimecode24(1440, '21:00')).toBe('21:01:00:00')
    })

    it('quantizes shot timelines carrying timecodes', () => {
        const receipt = quantizeShotTimeline(
            [
                { shot_id: 'sh01', duration_ms: 1000 },
                { shot_id: 'sh02', duration_ms: 1000 },
            ],
            '21:00',
        )
        expect(receipt.shots.length).toBe(2)
        expect(receipt.shots[0]?.from_timecode).toBe('21:00:00:00')
        expect(receipt.shots[0]?.to_timecode).toBeDefined()
        const legacy = quantizeShotTimeline([
            { shot_id: 'sh01', duration_ms: 1000 },
        ])
        expect(legacy.shots[0]?.from_frame).toBeGreaterThanOrEqual(0)
        expect(legacy.shots[0]?.from_timecode).toBeDefined()
    })

    it('anchors episode chronology then advances scenes', () => {
        const model = new EpisodeModel()
        anchorEpisodeChronology(
            model,
            {
                idx: 't',
                dat: {
                    seriesSlug: 'wiregrass-basin',
                    startDate: '2026-10-31',
                    startTimeHm: '21:00',
                    framesPerSecond: 24,
                },
            } as any,
            undefined as any,
        )
        expect(model.sceneTimeline.length).toBe(0)
        expect(model.cumulativeFrames).toBe(0)
        advanceEpisodeScene(
            model,
            {
                idx: 't',
                dat: { sceneId: 'ep01_sc01', durationFrames: 48 },
            } as any,
            undefined as any,
        )
        expect(model.sceneTimeline.length).toBe(1)
        expect(model.cumulativeFrames).toBe(48)
        expect(model.sceneTimeline[0]?.startTimecode).toBe('21:00:00:00')
    })

    it('validates exposure sheet chronology under strict schema', () => {
        const base = assembleExposureSheetDocument(
            'wiregrass-basin',
            'ep01_sc01',
            [
                {
                    shot_id: 'sh01',
                    from_frame: 0,
                    to_frame: 23,
                    stem_path: 'a.wav',
                },
            ],
            [],
        )
        expect(() => ExposureSheetDocumentSchema.parse(base)).not.toThrow()
        const stamped = assembleExposureSheetDocument(
            'wiregrass-basin',
            'ep01_sc01',
            [
                {
                    shot_id: 'sh01',
                    from_frame: 0,
                    to_frame: 23,
                    stem_path: 'a.wav',
                },
            ],
            [],
            'audio/ambient/machinery_bed.wav',
            0.4,
            {
                start_date: '2026-10-31',
                start_time_hm: '21:00',
                start_timecode_smpte: '21:00:00:00',
                end_timecode_smpte: '21:00:00:23',
                daypart: 'NIGHT',
            },
        )
        expect(() => ExposureSheetDocumentSchema.parse(stamped)).not.toThrow()
        expect(stamped.chronology?.daypart).toBe('NIGHT')

        const tampered = {
            ...stamped,
            chronology: {
                ...stamped.chronology,
                extra_unknown_key: 'invalid',
            },
        }
        expect(() => ExposureSheetDocumentSchema.parse(tampered)).toThrow()
    })

    it('dispatches ANCHOR_EPISODE_CHRONOLOGY and ADVANCE_EPISODE_SCENE via CONDUCTOR.hunt', async () => {
        const anchorRes: any = await CONDUCTOR.hunt(ANCHOR_EPISODE_CHRONOLOGY, {
            idx: 'ep01',
            dat: { startDate: '2026-10-31', startTimeHm: '21:00' },
        })
        expect(anchorRes?.epsBit?.idx).toBe('anchor-episode-chronology-success')

        const advRes: any = await CONDUCTOR.hunt(ADVANCE_EPISODE_SCENE, {
            idx: 'ep01_sc01',
            dat: { sceneId: 'ep01_sc01', durationFrames: 48 },
        })
        expect(advRes?.epsBit?.idx).toBe('advance-episode-scene-success')
        expect(advRes?.epsBit?.dat?.startTimecode).toBe('21:00:00:00')
        expect(advRes?.epsBit?.dat?.endTimecode).toBe('21:00:01:23')

        expect(() =>
            anchorEpisodeChronology(
                new EpisodeModel(),
                { idx: 'bad', dat: { startTimeHm: '25:00' } } as any,
                undefined as any,
            ),
        ).toThrow(/INVALID_START_CLOCK/)
    })
})
