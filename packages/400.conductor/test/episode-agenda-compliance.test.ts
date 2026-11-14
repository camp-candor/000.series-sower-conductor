import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { reconcileEpisodeAgendaCompliance } from '../25.episode.unit/buz/episode.buzz.js'
import { compileAutoScriptDirectoryPipeline } from '../16.pipeline.unit/buz/pipeline.buzz.js'
import { EpisodeStackManifestSchema } from '../16.pipeline.unit/fce/pipeline.interface.js'

const makeAgendaScene = (
    date: string,
    time: string,
    cue: string,
    beatId?: string,
    scheduledTime?: string,
    reserveTicks?: number,
) => `Title: Stack Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: test_scene
Date: ${date}
Start-Time: ${time}
Timecode: ${time}:00:00
Daypart: NIGHT
${beatId ? `Agenda-Beat-Id: ${beatId}\n` : ''}${scheduledTime ? `Scheduled-Time: ${scheduledTime}\n` : ''}${reserveTicks !== undefined ? `Reserve-Held-Ticks: ${reserveTicks}\n` : ''}
INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

${cue}
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

describe('Episode Agenda Compliance Reconciler', () => {
    let tmp: string

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-stack-'))
    })

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true })
    })

    it('matches exact deadline with zero delta', () => {
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene(
                '2026-10-31',
                '23:30',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:30',
                0,
            ),
            'utf8',
        )
        const manifest = compileAutoScriptDirectoryPipeline(tmp, {
            expectedAgendaBeats: [
                {
                    beat_id: 'curfew_2330',
                    isoDate: '2026-10-31',
                    startTimeHm: '23:30',
                },
            ],
        })
        expect(() => EpisodeStackManifestSchema.parse(manifest)).not.toThrow()
        expect(manifest.agendaCompliance).toBeDefined()
        expect(manifest.agendaCompliance?.compliant).toBe(true)
        expect(manifest.agendaCompliance?.expectedCount).toBe(1)
        expect(manifest.agendaCompliance?.realizedCount).toBe(1)
        expect(
            manifest.agendaCompliance?.matchedBeats[0]?.timingDeltaSeconds,
        ).toBe(0)
        expect(manifest.agendaCompliance?.missingBeatIds).toEqual([])
    })

    it('rejects missing deadline under strict mode', () => {
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene(
                '2026-10-31',
                '21:00',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:30',
                0,
            ),
            'utf8',
        )
        expect(() =>
            compileAutoScriptDirectoryPipeline(tmp, {
                expectedAgendaBeats: [
                    {
                        beat_id: 'curfew_2330',
                        isoDate: '2026-10-31',
                        startTimeHm: '23:30',
                    },
                    {
                        beat_id: 'dawn_drop',
                        isoDate: '2026-11-01',
                        startTimeHm: '06:00',
                    },
                ],
                requireAllScheduledBeats: true,
            }),
        ).toThrow(/AGENDA_DEADLINE_MISSED/)
    })

    it('computes timingDeltaSeconds accurately in UTC integer math', () => {
        const report = reconcileEpisodeAgendaCompliance(
            [
                {
                    scene_id: 'ep01_sc01',
                    start_date: '2026-10-31',
                    start_time_hm: '21:15',
                    agenda_beat_id: 'curfew_2330',
                    scheduled_time: '2026-10-31 21:15',
                },
            ],
            [
                {
                    beat_id: 'curfew_2330',
                    isoDate: '2026-10-31',
                    startTimeHm: '21:00',
                },
            ],
        )
        expect(report.compliant).toBe(true)
        expect(report.matchedBeats[0]?.timingDeltaSeconds).toBe(900)
        const exact = reconcileEpisodeAgendaCompliance(
            [
                {
                    chronology: {
                        start_date: '2026-10-31',
                        start_time_hm: '23:30',
                        agenda: {
                            agenda_beat_id: 'curfew_2330',
                            scheduled_time: '2026-10-31 23:30',
                            reserve_held_ticks: 0,
                        },
                    },
                    scene_id: 'ep01_sc02',
                },
            ],
            [
                {
                    beat_id: 'curfew_2330',
                    isoDate: '2026-10-31',
                    startTimeHm: '23:30',
                },
            ],
        )
        expect(exact.matchedBeats[0]?.timingDeltaSeconds).toBe(0)
    })

    it('defaults legacy stacks without expected beats', () => {
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene('2026-10-31', '21:00', 'JOHNNY'),
            'utf8',
        )
        const manifest = compileAutoScriptDirectoryPipeline(tmp)
        expect(manifest.agendaCompliance?.compliant).toBe(true)
        expect(manifest.agendaCompliance?.expectedCount).toBe(0)
        expect(manifest.agendaCompliance?.realizedCount).toBe(0)
        expect(manifest.agendaCompliance?.missingBeatIds).toEqual([])
        expect(() => EpisodeStackManifestSchema.parse(manifest)).not.toThrow()
    })
})
