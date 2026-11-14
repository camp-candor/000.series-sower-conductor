import { describe, it, expect } from 'vitest'
import {
    extractSceneTransitions,
    mapTransitionToPauseFrames,
} from '../12.scene.unit/buz/scene.buzz.js'
import { extractDialogueTurnsWithParentheticals } from '../25.dialogue.unit/buz/dialogue.buzz.js'

const DRAMATIC_FOUNTAIN = `Title: Dramatic Test
Date: 2026-10-31
Start-Time: 21:00
Daypart: NIGHT

INT. DINER - NIGHT

Rain drums on tin roof.

JOHNNY
(whispers)
Miss Beverly, do you copy?

CUT TO:

EXT. PORCH - NIGHT

ORBIE
(teeth clenched)
I copy loud plus clear.

SMASH CUT TO:

INT. KITCHEN - NIGHT

TIME CUT: 2 HOURS LATER

FADE OUT.
`

describe('Scene Dialogue Dramatic Compiler', () => {
    it('maps transition timing to integer frame budgets', () => {
        expect(mapTransitionToPauseFrames('SMASH CUT TO:')).toBe(0)
        expect(mapTransitionToPauseFrames('CUT TO:')).toBe(4)
        expect(mapTransitionToPauseFrames('DISSOLVE TO:')).toBe(18)
        expect(mapTransitionToPauseFrames('TIME CUT: 2 HOURS LATER')).toBe(24)
        expect(mapTransitionToPauseFrames('TIME CUT: 2026-11-01 05:00')).toBe(
            24,
        )
        expect(mapTransitionToPauseFrames('FADE OUT.')).toBe(36)
        for (const v of [
            mapTransitionToPauseFrames('CUT TO:'),
            mapTransitionToPauseFrames('SMASH CUT TO:'),
            mapTransitionToPauseFrames('DISSOLVE TO:'),
            mapTransitionToPauseFrames('TIME CUT: X'),
            mapTransitionToPauseFrames('FADE OUT.'),
        ]) {
            expect(Number.isInteger(v)).toBe(true)
        }
    })

    it('extracts ordered transition rules', () => {
        const rules = extractSceneTransitions(DRAMATIC_FOUNTAIN)
        expect(rules.length).toBe(4)
        expect(rules[0]?.rawLine).toBe('CUT TO:')
        expect(rules[0]?.pauseFrames).toBe(4)
        expect(rules[1]?.rawLine).toBe('SMASH CUT TO:')
        expect(rules[1]?.pauseFrames).toBe(0)
        expect(rules[2]?.pauseFrames).toBe(24)
        expect(rules[3]?.pauseFrames).toBe(36)
    })

    it('pairs parenthetical cues with dialogue turns', () => {
        const turns = extractDialogueTurnsWithParentheticals(DRAMATIC_FOUNTAIN)
        expect(turns.length).toBe(2)
        expect(turns[0]?.speaker).toBe('JOHNNY')
        expect(turns[0]?.parenthetical).toBe('whispers')
        expect(turns[0]?.dialogueText).toMatch(/Miss Beverly/)
        expect(turns[1]?.speaker).toBe('ORBIE')
        expect(turns[1]?.parenthetical).toBe('teeth clenched')
    })

    it('sanitizes output to pure ASCII', () => {
        const fancy = `Title: T\nDate: 2026-10-31\nStart-Time: 21:00\n\nINT. DINER - NIGHT\n\nJOHNNY\n(whispers)\nCaf\u00e9 na\u00efve \u201cquoted\u201d.\n`
        const turns = extractDialogueTurnsWithParentheticals(fancy)
        expect(turns.length).toBe(1)
        const text = turns[0]?.dialogueText ?? ''
        expect(/^[\x20-\x7E\r\n\t]*$/.test(text)).toBe(true)
    })

    it('aligns parentheticals across mixed parentheticaled and bare turns without shifting', () => {
        const mixed = `Title: Mixed Turns
Date: 2026-10-31
Start-Time: 21:00

INT. BARN - NIGHT

JOHNNY
(grimacing)
Hold the lantern steady.

ORBIE
Copy that, moving left.

JOHNNY
(whispering)
Keep low by the gate.

CUT TO:
`
        const turns = extractDialogueTurnsWithParentheticals(mixed)
        expect(turns.length).toBe(3)
        expect(turns[0]).toMatchObject({
            turnIndex: 0,
            speaker: 'JOHNNY',
            parenthetical: 'grimacing',
            dialogueText: 'Hold the lantern steady.',
        })
        expect(turns[1]).toMatchObject({
            turnIndex: 1,
            speaker: 'ORBIE',
            parenthetical: null,
            dialogueText: 'Copy that, moving left.',
        })
        expect(turns[2]).toMatchObject({
            turnIndex: 2,
            speaker: 'JOHNNY',
            parenthetical: 'whispering',
            dialogueText: 'Keep low by the gate.',
        })
    })
})
