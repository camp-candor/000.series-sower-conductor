import { describe, it, expect } from 'vitest'
import {
    auditFountainSixCategories,
    sortStackedScreenplayFiles,
    isFountainTransitionLine,
    isFountainParenthetical,
} from '../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'

const VALID_STACK_SCRIPT = `Title: Stack Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: ep01_sc01
Date: 2026-10-31
Start-Time: 21:00
Timecode: 21:00:00:00
Daypart: NIGHT

INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

JOHNNY
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

describe('Stacked Fountain Six-Category Validator', () => {
    it('accepts complete six-category screenplay', () => {
        const report = auditFountainSixCategories(VALID_STACK_SCRIPT)
        expect(report.sluglines.count).toBeGreaterThan(0)
        expect(report.actionLines.count).toBeGreaterThan(0)
        expect(report.characterCues.count).toBeGreaterThan(0)
        expect(report.parentheticals.count).toBeGreaterThan(0)
        expect(report.dialogueLines.count).toBeGreaterThan(0)
        expect(report.transitions.count).toBeGreaterThan(0)
        expect(report.dateHeader).toBe('2026-10-31')
        expect(report.startTimeHm).toBe('21:00')
        expect(report.allValid).toBe(true)
        expect(report.sluglines.example).toMatch(/INT\./)
        expect(report.transitions.example).toMatch(/CUT TO:/)
        expect(report.parentheticals.example).toMatch(/whispers/)
    })

    it('rejects screenplay missing parenthetical cue', () => {
        const missing = VALID_STACK_SCRIPT.replace(
            '(whispers)',
            'Miss Beverly speaks softly.',
        )
        const report = auditFountainSixCategories(missing)
        expect(report.parentheticals.count).toBe(0)
        expect(report.allValid).toBe(false)
    })

    it('rejects screenplay missing transition marker', () => {
        const missing = VALID_STACK_SCRIPT.replace(
            'CUT TO:',
            'Rain keeps falling hard.',
        )
        const report = auditFountainSixCategories(missing)
        expect(report.transitions.count).toBe(0)
        expect(report.allValid).toBe(false)
    })

    it('rejects truncated hollow screenplay fail-closed', () => {
        const hollow = `Title: Hollow\nDate: 2026-10-31\nStart-Time: 21:00\n\nINT. DINER - NIGHT\n`
        const report = auditFountainSixCategories(hollow)
        expect(report.allValid).toBe(false)
    })

    it('ignores stage header comments during audit', () => {
        const withComment = `Title: T\nDate: 2026-10-31\nStart-Time: 21:00\n\n/*\nJOHNNY\n(fake cue inside comment)\nCUT TO:\n*/\n${VALID_STACK_SCRIPT}`
        const report = auditFountainSixCategories(withComment)
        expect(report.allValid).toBe(true)
        expect(report.characterCues.count).toBe(1)
    })

    it('classifies transition variants correctly', () => {
        expect(isFountainTransitionLine('CUT TO:')).toBe(true)
        expect(isFountainTransitionLine('SMASH CUT TO:')).toBe(true)
        expect(isFountainTransitionLine('DISSOLVE TO:')).toBe(true)
        expect(isFountainTransitionLine('TIME CUT: 2 HOURS LATER')).toBe(true)
        expect(isFountainTransitionLine('FADE OUT.')).toBe(true)
        expect(isFountainTransitionLine('> MATCH CUT')).toBe(true)
        expect(isFountainTransitionLine('JOHNNY')).toBe(false)
        expect(isFountainParenthetical('(whispers)')).toBe(true)
        expect(isFountainParenthetical('(teeth clenched)')).toBe(true)
        expect(isFountainParenthetical('Miss Beverly')).toBe(false)
    })

    it('sorts stacked files lexicographically via sequence', () => {
        const input = [
            '0003_tick03.fountain',
            '0001_tick01.fountain',
            'notes.txt',
            '0002_tick02.fountain',
        ]
        const sorted = sortStackedScreenplayFiles(input)
        expect(sorted).toEqual([
            '0001_tick01.fountain',
            '0002_tick02.fountain',
            '0003_tick03.fountain',
        ])
    })

    it('orders stack independent from OS insertion order', () => {
        const a = ['0002_b.fountain', '0001_a.fountain']
        const b = ['0001_a.fountain', '0002_b.fountain']
        expect(sortStackedScreenplayFiles(a)).toEqual(
            sortStackedScreenplayFiles(b),
        )
    })

    it('rejects bare script containing six-category tokens only inside block comments', () => {
        const bareCommentTrap = `Title: Comment Trap
Date: 2026-10-31
Start-Time: 21:00

/* [SPATIAL_STAGE_HEADER]
INT. FAKE - NIGHT

Fake action line.

JOHNNY
(fake parenthetical)
Fake dialogue line.

CUT TO:
*/
`
        const report = auditFountainSixCategories(bareCommentTrap)
        expect(report.allValid).toBe(false)
        expect(report.sluglines.count).toBe(0)
        expect(report.actionLines.count).toBe(0)
        expect(report.characterCues.count).toBe(0)
        expect(report.parentheticals.count).toBe(0)
        expect(report.dialogueLines.count).toBe(0)
        expect(report.transitions.count).toBe(0)
    })

    it('fails closed when any single one of the 6 categories is omitted', () => {
        const cases: Array<{ name: string; script: string }> = [
            {
                name: 'missing slugline',
                script: VALID_STACK_SCRIPT.replace('INT. DINER - NIGHT\n', ''),
            },
            {
                name: 'missing action',
                script: VALID_STACK_SCRIPT.replace(
                    'Rain hammers tin roof above empty booths.\n',
                    '',
                ),
            },
            {
                name: 'missing character cue',
                script: VALID_STACK_SCRIPT.replace('JOHNNY\n', ''),
            },
            {
                name: 'missing parenthetical',
                script: VALID_STACK_SCRIPT.replace('(whispers)\n', ''),
            },
            {
                name: 'missing dialogue',
                script: VALID_STACK_SCRIPT.replace(
                    'Miss Beverly, do you copy?\n',
                    '',
                ),
            },
            {
                name: 'missing transition',
                script: VALID_STACK_SCRIPT.replace('CUT TO:\n', ''),
            },
        ]
        for (const c of cases) {
            const report = auditFountainSixCategories(c.script)
            expect(report.allValid, c.name).toBe(false)
        }
    })

    it('sorts reversed numeric sequences ascending (0001, 0002, 0010)', () => {
        expect(
            sortStackedScreenplayFiles([
                '0010_late.fountain',
                '0002_mid.fountain',
                '0001_early.fountain',
            ]),
        ).toEqual([
            '0001_early.fountain',
            '0002_mid.fountain',
            '0010_late.fountain',
        ])
        expect(
            sortStackedScreenplayFiles([
                '10_late.fountain',
                '2_mid.fountain',
                '1_early.fountain',
            ]),
        ).toEqual(['1_early.fountain', '2_mid.fountain', '10_late.fountain'])
    })
})
