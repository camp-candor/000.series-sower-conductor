import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { compileAutoScriptDirectoryPipeline } from '../16.pipeline.unit/buz/pipeline.buzz.js'
import {
    sealEpisodeStackReceipt,
    verifyConductorStackReplayEquivalence,
} from '../13.receipt.unit/buz/receipt.buzz.js'

const makeAgendaScene = (
    date: string,
    time: string,
    cue: string,
    beatId?: string,
    scheduledTime?: string,
) => `Title: Seal Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: test_scene
Date: ${date}
Start-Time: ${time}
Timecode: ${time}:00:00
Daypart: NIGHT
${beatId ? `Agenda-Beat-Id: ${beatId}\n` : ''}${scheduledTime ? `Scheduled-Time: ${scheduledTime}\n` : ''}
INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

${cue}
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

const seedAgendaDir = (dir: string) => {
    fs.writeFileSync(
        path.join(dir, '0001_tick01.fountain'),
        makeAgendaScene(
            '2026-10-31',
            '23:30',
            'JOHNNY',
            'curfew_2330',
            '2026-10-31 23:30',
        ),
        'utf8',
    )
    fs.writeFileSync(
        path.join(dir, '0002_tick02.fountain'),
        makeAgendaScene(
            '2026-11-01',
            '06:00',
            'ORBIE',
            'dawn_drop',
            '2026-11-01 06:00',
        ),
        'utf8',
    )
}

describe('Receipt Agenda Seal', () => {
    let tmp: string

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-seal-'))
    })

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true })
    })

    it('seals deterministically and stays sensitive to schedule edits', () => {
        seedAgendaDir(tmp)
        const manifest = compileAutoScriptDirectoryPipeline(tmp)
        const a = sealEpisodeStackReceipt(manifest)
        const b = sealEpisodeStackReceipt(manifest)
        expect(a.manifest_sha256).toBe(b.manifest_sha256)
        expect(a.manifest_sha256).toMatch(/^[0-9a-f]{64}$/)

        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene(
                '2026-10-31',
                '23:30',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:45',
            ),
            'utf8',
        )
        const edited = compileAutoScriptDirectoryPipeline(tmp)
        const c = sealEpisodeStackReceipt(edited)
        expect(c.manifest_sha256).not.toBe(a.manifest_sha256)
    })

    it('reproduces identical seal after deleting outputs and re-ingesting', () => {
        seedAgendaDir(tmp)
        const manifest = compileAutoScriptDirectoryPipeline(tmp, {
            manifestOutPath: path.join(tmp, 'episode_manifest.json'),
        })
        const receipt = sealEpisodeStackReceipt(manifest)
        fs.writeFileSync(
            path.join(tmp, 'stack_receipt.json'),
            JSON.stringify(receipt, null, 2),
            'utf8',
        )
        const beforeSha = receipt.manifest_sha256
        fs.rmSync(path.join(tmp, 'episode_manifest.json'), { force: true })
        fs.rmSync(path.join(tmp, 'stack_receipt.json'), { force: true })
        const equiv = verifyConductorStackReplayEquivalence(tmp, tmp)
        expect(equiv.equivalent).toBe(true)
        expect(equiv.mismatches).toEqual([])
        const reingested = compileAutoScriptDirectoryPipeline(tmp)
        const after = sealEpisodeStackReceipt(reingested)
        expect(after.manifest_sha256).toBe(beforeSha)
    })

    it('seals legacy stacks without scheduled beats smoothly', () => {
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene('2026-10-31', '21:00', 'JOHNNY'),
            'utf8',
        )
        const manifest = compileAutoScriptDirectoryPipeline(tmp)
        const receipt = sealEpisodeStackReceipt(manifest)
        expect(receipt.manifest_sha256).toMatch(/^[0-9a-f]{64}$/)
        expect(manifest.agendaCompliance?.compliant).toBe(true)
        const again = sealEpisodeStackReceipt(
            compileAutoScriptDirectoryPipeline(tmp),
        )
        expect(again.manifest_sha256).toBe(receipt.manifest_sha256)
    })

    it('diverges deterministically when Reserve-Held-Ticks or missingBeatIds change', () => {
        seedAgendaDir(tmp)
        const baseline = compileAutoScriptDirectoryPipeline(tmp, {
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
        })
        const baseReceipt = sealEpisodeStackReceipt(baseline)

        const withMissingBeat = compileAutoScriptDirectoryPipeline(tmp, {
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
                {
                    beat_id: 'midnight_bell',
                    isoDate: '2026-11-01',
                    startTimeHm: '00:00',
                },
            ],
        })
        const missingReceipt = sealEpisodeStackReceipt(withMissingBeat)
        expect(missingReceipt.manifest_sha256).not.toBe(
            baseReceipt.manifest_sha256,
        )

        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            `${makeAgendaScene(
                '2026-10-31',
                '23:30',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:30',
            ).replace(
                'Scheduled-Time: 2026-10-31 23:30',
                'Scheduled-Time: 2026-10-31 23:30\nReserve-Held-Ticks: 2',
            )}`,
            'utf8',
        )
        const withReserveTicks = compileAutoScriptDirectoryPipeline(tmp, {
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
        })
        const reserveReceipt = sealEpisodeStackReceipt(withReserveTicks)
        expect(reserveReceipt.manifest_sha256).not.toBe(
            baseReceipt.manifest_sha256,
        )
    })
})
