import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
    compileSceneAgendaTentpoleCue,
    mapAgendaTentpolePauseFrames,
} from '../12.scene.unit/buz/scene.buzz.js'
import { compileAutoScriptDirectoryPipeline } from '../16.pipeline.unit/buz/pipeline.buzz.js'
import { compileSeriesSceneAst } from '../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'

const makeAgendaFountain = (
    beatId?: string,
    scheduledTime?: string,
    reserveTicks?: number,
) => `Title: Slate Test
Credit: Test
Author: Test
Series: wiregrass-basin
Scene: ep01_sc01
Date: 2026-10-31
Start-Time: 23:30
Timecode: 23:30:00:00
Daypart: NIGHT
${beatId ? `Agenda-Beat-Id: ${beatId}\n` : ''}${scheduledTime ? `Scheduled-Time: ${scheduledTime}\n` : ''}${reserveTicks !== undefined ? `Reserve-Held-Ticks: ${reserveTicks}\n` : ''}
INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

JOHNNY
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

describe('Scene Agenda Slate Framing', () => {
    it('detects tentpole cue with integer 24fps pause budgeting', () => {
        expect(mapAgendaTentpolePauseFrames(false, 0)).toBe(24)
        expect(mapAgendaTentpolePauseFrames(true, 0)).toBe(36)
        expect(mapAgendaTentpolePauseFrames(false, 4)).toBe(36)
        for (const v of [
            mapAgendaTentpolePauseFrames(false, 0),
            mapAgendaTentpolePauseFrames(true, 2),
            mapAgendaTentpolePauseFrames(false, 5),
        ]) {
            expect(Number.isInteger(v)).toBe(true)
        }
    })

    it('tags agenda tentpole scenes and leaves ambient scenes untouched', () => {
        const tentpoleAst = compileSeriesSceneAst(
            makeAgendaFountain('curfew_2330', '2026-10-31 23:30', 0),
            { sceneId: 'ep01_sc01', skipDiskWrite: true },
        )
        const cue = compileSceneAgendaTentpoleCue(tentpoleAst as any)
        expect(cue.agendaTentpole).toBe(true)
        expect(cue.beatId).toBe('curfew_2330')
        expect(cue.scheduledTime).toBe('2026-10-31 23:30')
        expect(cue.slateLeadPauseFrames).toBeGreaterThanOrEqual(24)
        expect(Number.isInteger(cue.slateLeadPauseFrames)).toBe(true)

        const heldAst = compileSeriesSceneAst(
            makeAgendaFountain('dawn_drop', '2026-11-01 06:00', 2),
            { sceneId: 'ep01_sc02', skipDiskWrite: true },
        )
        const heldCue = compileSceneAgendaTentpoleCue(heldAst as any)
        expect(heldCue.agendaTentpole).toBe(true)
        expect(heldCue.slateLeadPauseFrames).toBe(36)

        const ambientAst = compileSeriesSceneAst(
            `Title: Ambient
Series: wiregrass-basin
Scene: ep01_sc03
Date: 2026-10-31
Start-Time: 21:00
Timecode: 21:00:00:00
Daypart: NIGHT

INT. DINER - NIGHT

JOHNNY
Miss Beverly, do you copy?
`,
            { sceneId: 'ep01_sc03', skipDiskWrite: true },
        )
        const ambientCue = compileSceneAgendaTentpoleCue(ambientAst as any)
        expect(ambientCue.agendaTentpole).toBe(false)
        expect(ambientCue.slateLeadPauseFrames).toBe(0)
    })

    it('populates agendaTentpole rows inside compiled episode manifest', () => {
        let tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slate-'))
        try {
            fs.writeFileSync(
                path.join(tmp, '0001_tick01.fountain'),
                makeAgendaFountain('curfew_2330', '2026-10-31 23:30', 0),
                'utf8',
            )
            fs.writeFileSync(
                path.join(tmp, '0002_tick02.fountain'),
                makeAgendaFountain(undefined, undefined, undefined).replace(
                    'Start-Time: 23:30',
                    'Start-Time: 21:00',
                ),
                'utf8',
            )
            const manifest = compileAutoScriptDirectoryPipeline(tmp)
            const tentpole = manifest.scenes.find((s) =>
                s.file_name.includes('0001'),
            )!
            const ambient = manifest.scenes.find((s) =>
                s.file_name.includes('0002'),
            )!
            expect(tentpole.agendaTentpole).toBe(true)
            expect(tentpole.slateLeadPauseFrames).toBeGreaterThanOrEqual(24)
            expect(Number.isInteger(tentpole.slateLeadPauseFrames!)).toBe(true)
            expect(ambient.agendaTentpole).toBe(false)
            expect(ambient.slateLeadPauseFrames).toBe(0)
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true })
        }
    })
})
