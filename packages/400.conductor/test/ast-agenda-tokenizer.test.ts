import { describe, it, expect } from 'vitest'
import {
    parseFountainDialogue,
    parseFountainChronology,
    auditFountainSixCategories,
} from '../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'
import { compileSeriesSceneAst } from '../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'
import { SceneASTSchema } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

const FOUNTAIN_WITH_AGENDA = `Title: Parallax Dinner
Credit: Test
Author: Test Author
Draft date: 2026-10-31
Contact: Test
Series: wiregrass-basin
Scene: ep01_sc01
Date: 2026-10-31
Start-Time: 21:00
Timecode: 21:00:00:00
Daypart: NIGHT
Timezone: America-Chicago
Era: Present
Agenda-Beat-Id: curfew_2330
Scheduled-Time: 2026-10-31 23:30
Reserve-Held-Ticks: 4

INT. DINER - NIGHT

JOHNNY
Miss Beverly, do you copy?

ORBIE
I copy, Walkman.
`

const FOUNTAIN_LEGACY = `Title: Parallax Dinner
Credit: Test
Author: Test Author
Series: wiregrass-basin
Scene: ep01_sc01
Date: 2026-10-31
Start-Time: 21:00
Timecode: 21:00:00:00
Daypart: NIGHT

INT. DINER - NIGHT

JOHNNY
Miss Beverly, do you copy?
`

describe('AST Agenda Tokenizer', () => {
    it('tokenizes agenda headers into structured agenda fields', () => {
        const headers = parseFountainChronology(FOUNTAIN_WITH_AGENDA)
        expect(headers.agendaBeatId).toBe('curfew_2330')
        expect(headers.scheduledTime).toBe('2026-10-31 23:30')
        expect(headers.reserveHeldTicks).toBe(4)
        expect(headers.agenda).toEqual({
            beatId: 'curfew_2330',
            scheduledTime: '2026-10-31 23:30',
            reserveHeldTicks: 4,
        })
    })

    it('isolates multi-line opening metadata from body action tokens', () => {
        const turns = parseFountainDialogue(FOUNTAIN_WITH_AGENDA)
        expect(turns.length).toBe(2)
        expect(turns[0]?.speaker).toBe('JOHNNY')
        for (const t of turns) {
            expect(t.speaker).not.toMatch(/AGENDA|SCHEDULED|RESERVE/i)
            expect(t.dialogueText).not.toMatch(/curfew_2330|23:30/)
        }
        const headers = parseFountainChronology(FOUNTAIN_WITH_AGENDA)
        expect(headers.date).toBe('2026-10-31')
        expect(headers.startTimeHm).toBe('21:00')
    })

    it('rejects malformed Scheduled-Time fail-closed', () => {
        expect(() =>
            parseFountainChronology(
                'Date: 2026-10-31\nStart-Time: 21:00\nTimecode: 21:00:00:00\nDaypart: NIGHT\nAgenda-Beat-Id: curfew_2330\nScheduled-Time: 23:30 tonight\n',
            ),
        ).toThrow(/INVALID_FOUNTAIN_AGENDA_TIMESTAMP/)
        expect(() =>
            parseFountainChronology(
                'Agenda-Beat-Id: curfew_2330\nScheduled-Time: 2026/10/31 23:30\n',
            ),
        ).toThrow(/INVALID_FOUNTAIN_AGENDA_TIMESTAMP/)
        expect(() =>
            parseFountainChronology(
                'Agenda-Beat-Id: curfew_2330\nScheduled-Time: 2026-99-99 25:99\n',
            ),
        ).toThrow(/INVALID_FOUNTAIN_AGENDA_TIMESTAMP/)
        expect(() =>
            parseFountainChronology(
                'Agenda-Beat-Id: curfew_2330\nScheduled-Time: 2026-99-99 23:30\n',
            ),
        ).toThrow(/INVALID_FOUNTAIN_AGENDA_TIMESTAMP/)
    })

    it('prevents End-Time, Act, and Agenda headers from leaking as ACTION body tokens', () => {
        const script = `Title: Six Cat Test
Date: 2026-10-31
Start-Time: 23:00
End-Time: 23:45
Timecode: 23:00:00:00
Daypart: NIGHT
Act: III
Agenda-Beat-Id: curfew_2330
Scheduled-Time: 2026-10-31 23:30
Reserve-Held-Ticks: 2

INT. DINER - NIGHT

Rain hammers the tin roof.

JOHNNY
(quietly)
Time to close up.

CUT TO:
`
        const report = auditFountainSixCategories(script)
        expect(report.allValid).toBe(true)
        expect(report.actionLines.count).toBe(1)
        expect(report.actionLines.example).toBe('Rain hammers the tin roof.')
        expect(report.chronology.agenda).toEqual({
            beatId: 'curfew_2330',
            scheduledTime: '2026-10-31 23:30',
            reserveHeldTicks: 2,
        })
    })

    it('parses legacy scripts omitting agenda headers cleanly', () => {
        const headers = parseFountainChronology(FOUNTAIN_LEGACY)
        expect(headers.agenda).toBeUndefined()
        expect(headers.agendaBeatId).toBeUndefined()
        expect(headers.scheduledTime).toBeUndefined()
    })

    it('propagates chronology.agenda into compiled SceneAST', () => {
        const ast = compileSeriesSceneAst(FOUNTAIN_WITH_AGENDA, {
            sceneId: 'ep01_sc01',
            skipDiskWrite: true,
        })
        expect(ast.chronology?.agenda).toEqual({
            agenda_beat_id: 'curfew_2330',
            scheduled_time: '2026-10-31 23:30',
            reserve_held_ticks: 4,
        })
        expect(() => SceneASTSchema.parse(ast)).not.toThrow()

        const legacyAst = compileSeriesSceneAst(FOUNTAIN_LEGACY, {
            sceneId: 'ep01_sc02',
            skipDiskWrite: true,
        })
        expect(legacyAst.chronology?.agenda).toBeUndefined()
        expect(() => SceneASTSchema.parse(legacyAst)).not.toThrow()
    })
})
