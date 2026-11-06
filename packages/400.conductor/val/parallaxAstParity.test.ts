import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    parseFountainDialogue,
    normalizePunctuation,
} from '../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'
import { assertVerbatimParity } from '../34.abstractsyntaxtree.unit/buz/assertParity.buzz.js'
import {
    PARALLAX_DINNER_FOUNTAIN_SOURCE,
    compileParallaxSceneAst,
} from '../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'
import { SceneASTSchema } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

describe('Phase 1 Fountain Tokenizer Patch & Deterministic Parallax Dinner AST Compiler', () => {
    const draftsPath = path.resolve(process.cwd(), 'drafts/dialogue_ast.json')

    beforeEach(() => {
        // Run compiler to ensure ast is fresh
        compileParallaxSceneAst(PARALLAX_DINNER_FOUNTAIN_SOURCE)
    })

    it("extracts all 34 spoken turns including (CONT'D) cues", () => {
        const turns = parseFountainDialogue(PARALLAX_DINNER_FOUNTAIN_SOURCE)
        expect(turns.length).toBe(34)

        let johnnyCount = 0
        let orbieCount = 0
        let orbieContdText = 0

        for (const t of turns) {
            if (t.speaker === 'JOHNNY') johnnyCount++
            if (t.speaker === 'ORBIE') orbieCount++
        }

        expect(johnnyCount).toBe(17)
        expect(orbieCount).toBe(17)
    })

    it('validates drafts/dialogue_ast.json against SceneASTSchema with 100% 7-bit ASCII lines', () => {
        const raw = JSON.parse(fs.readFileSync(draftsPath, 'utf8'))
        const parsed = SceneASTSchema.parse(raw)

        expect(parsed.scene_id).toBe('ep01_sc01')
        expect(parsed.lines.length).toBe(34)

        for (const line of parsed.lines) {
            // Check 7-bit ASCII
            expect(/[\x80-\xFF]/.test(line.dialogue_clean_ascii)).toBe(false)
        }
    })

    it('confirms 0 mismatches via assertVerbatimParity', () => {
        const raw = JSON.parse(fs.readFileSync(draftsPath, 'utf8'))
        const parsed = SceneASTSchema.parse(raw)
        const astLines = parsed.lines.map((l) => l.dialogue_clean_ascii)

        const report = assertVerbatimParity(
            PARALLAX_DINNER_FOUNTAIN_SOURCE,
            astLines,
        )
        expect(report.ok).toBe(true)
        expect(report.mismatches.length).toBe(0)
    })

    it('throws PARITY_COUNT_MISMATCH when a turn is omitted', () => {
        const raw = JSON.parse(fs.readFileSync(draftsPath, 'utf8'))
        const parsed = SceneASTSchema.parse(raw)
        const astLines = parsed.lines.map((l) => l.dialogue_clean_ascii)

        astLines.pop() // Omit a line

        expect(() =>
            assertVerbatimParity(PARALLAX_DINNER_FOUNTAIN_SOURCE, astLines),
        ).toThrowError(/PARITY_COUNT_MISMATCH/)
    })

    it('throws PARITY_TEXT_MISMATCH when a single word is mutated', () => {
        const raw = JSON.parse(fs.readFileSync(draftsPath, 'utf8'))
        const parsed = SceneASTSchema.parse(raw)
        const astLines = parsed.lines.map((l) => l.dialogue_clean_ascii)

        astLines[0] = astLines[0] + ' mutation'

        expect(() =>
            assertVerbatimParity(PARALLAX_DINNER_FOUNTAIN_SOURCE, astLines),
        ).toThrowError(/PARITY_TEXT_MISMATCH/)
    })
})
