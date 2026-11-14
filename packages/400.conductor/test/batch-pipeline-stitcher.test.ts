import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { compileAutoScriptDirectoryPipeline } from '../16.pipeline.unit/buz/pipeline.buzz.js'
import { EpisodeStackManifestSchema } from '../16.pipeline.unit/fce/pipeline.interface.js'

const makeScene = (
    date: string,
    time: string,
    cue: string,
) => `Title: Stack Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: test_scene
Date: ${date}
Start-Time: ${time}
Timecode: ${time}:00:00
Daypart: NIGHT

INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

${cue}
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

describe('Batch Pipeline Episodic Stitcher', () => {
    let tmp: string

    beforeEach(() => {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stack-'))
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeScene('2026-10-31', '21:00', 'JOHNNY'),
            'utf8',
        )
        fs.writeFileSync(
            path.join(tmp, '0002_tick02.fountain'),
            makeScene('2026-10-31', '21:15', 'ORBIE'),
            'utf8',
        )
    })

    afterEach(() => {
        fs.rmSync(tmp, { recursive: true, force: true })
    })

    it('ingests stacked scripts into chronological manifest', () => {
        const manifest = compileAutoScriptDirectoryPipeline(tmp)
        expect(manifest.scene_count).toBe(2)
        expect(manifest.scenes.length).toBe(2)
        expect(manifest.scenes[0]?.file_name).toBe('0001_tick01.fountain')
        expect(manifest.scenes[1]?.file_name).toBe('0002_tick02.fountain')
        expect(() => EpisodeStackManifestSchema.parse(manifest)).not.toThrow()
        expect(manifest.total_frames).toBeGreaterThan(0)
        const first = manifest.scenes[0]!
        const second = manifest.scenes[1]!
        expect(second.episode_from_frame).toBe(first.episode_to_frame + 1)
        expect(first.scene_timecode).toMatch(/^21:00:00:00$/)
        expect(second.scene_timecode).toMatch(/^21:15:00:00$/)
    })

    it('rejects incomplete script fail-closed', () => {
        fs.writeFileSync(
            path.join(tmp, '0003_tick03.fountain'),
            `Title: Hollow\nDate: 2026-10-31\nStart-Time: 22:00\n\nINT. NOWHERE - DAY\n`,
            'utf8',
        )
        expect(() => compileAutoScriptDirectoryPipeline(tmp)).toThrow(
            /AUTO_SCRIPT_SIX_CATEGORY_INCOMPLETE/,
        )
    })

    it('rejects path traversal input', () => {
        expect(() => compileAutoScriptDirectoryPipeline('../escape')).toThrow(
            /AUTO_SCRIPT_PATH_TRAVERSAL/,
        )
        expect(() =>
            compileAutoScriptDirectoryPipeline(tmp, {
                manifestOutPath: '../escape.json',
            }),
        ).toThrow(/AUTO_SCRIPT_PATH_TRAVERSAL/)
    })

    it('emits strict manifest with SMPTE continuity', () => {
        const manifest = compileAutoScriptDirectoryPipeline(tmp, {
            manifestOutPath: path.join(tmp, 'episode_manifest.json'),
        })
        expect(fs.existsSync(path.join(tmp, 'episode_manifest.json'))).toBe(
            true,
        )
        const raw = JSON.parse(
            fs.readFileSync(path.join(tmp, 'episode_manifest.json'), 'utf8'),
        )
        expect(() => EpisodeStackManifestSchema.parse(raw)).not.toThrow()
        expect(raw.scenes[0].episode_from_timecode).toMatch(
            /^\d{2}:\d{2}:\d{2}:\d{2}$/,
        )
        expect(raw.total_duration_ms).toBe(
            Math.round((raw.total_frames / 24) * 1000),
        )
    })

    it('stitches 3 scenes monotonically with contiguous frames and zero NaN', () => {
        fs.writeFileSync(
            path.join(tmp, '0003_tick03.fountain'),
            makeScene('2026-10-31', '21:30', 'MARTHA'),
            'utf8',
        )
        const manifest = compileAutoScriptDirectoryPipeline(tmp)
        expect(manifest.scenes.length).toBe(3)
        expect(manifest.scenes.map((s) => s.sequence_index)).toEqual([0, 1, 2])
        expect(Number.isNaN(manifest.total_frames)).toBe(false)
        expect(Number.isNaN(manifest.total_duration_ms)).toBe(false)
        for (let i = 0; i < manifest.scenes.length; i++) {
            const s = manifest.scenes[i]!
            expect(Number.isNaN(s.episode_from_frame)).toBe(false)
            expect(Number.isNaN(s.episode_to_frame)).toBe(false)
            if (i > 0) {
                expect(s.episode_from_frame).toBe(
                    manifest.scenes[i - 1]!.episode_to_frame + 1,
                )
            }
        }
        expect(() => EpisodeStackManifestSchema.parse(manifest)).not.toThrow()
    })

    it('rejects script missing only Transition fail-closed', () => {
        const missingTransition = makeScene(
            '2026-10-31',
            '21:45',
            'JOHNNY',
        ).replace('CUT TO:\n', '')
        fs.writeFileSync(
            path.join(tmp, '0004_broken.fountain'),
            missingTransition,
            'utf8',
        )
        expect(() => compileAutoScriptDirectoryPipeline(tmp)).toThrow(
            /AUTO_SCRIPT_SIX_CATEGORY_INCOMPLETE/,
        )
    })

    it('rejects nonexistent directory cleanly', () => {
        expect(() =>
            compileAutoScriptDirectoryPipeline(
                path.join(os.tmpdir(), 'nonexistent-stack-dir-9999'),
            ),
        ).toThrow(/AUTO_SCRIPT_INPUT_DIR_MISSING/)
    })
})
