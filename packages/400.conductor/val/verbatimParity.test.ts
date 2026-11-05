import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    parseFountainDialogue,
    normalizePunctuation,
} from '../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'
import { assertVerbatimParity } from '../34.abstractsyntaxtree.unit/buz/assertParity.buzz.js'
import { enforceParityGate } from '../34.abstractsyntaxtree.unit/buz/parityHaltController.buzz.js'

describe('packages/400.conductor Phase 3 Verbatim Screenplay AST Parity Assertion', () => {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')

    const validFountain = `
INT. BUNKER DRAINAGE - NIGHT

The steam rises from the culvert.

ELIAS
The pressure needle is shivering. Keep your hand off the brass until I tell you.

TORVIN
(stepping forward)
I told you twice, Elias. We're losing the seal.

ELIAS
Then hold the gasket!
`

    const validAstLines = [
        'The pressure needle is shivering. Keep your hand off the brass until I tell you.',
        "I told you twice, Elias. We're losing the seal.",
        'Then hold the gasket!',
    ]

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('normalizes smart typographical quotes, em-dashes, and ellipses idempotently', () => {
        const typographicalInput =
            '\u201CLook here,\u201D she said\u2014\u2018the pressure\u2026 it\u2019s rising.\u2019'
        const normalized = normalizePunctuation(typographicalInput)
        expect(normalized).toBe(
            "\"Look here,\" she said--'the pressure... it's rising.'",
        )

        // Idempotency assertion
        expect(normalizePunctuation(normalized)).toBe(normalized)
    })

    it('extracts spoken dialogue turns from Fountain prose while ignoring slugs and parentheticals', () => {
        const turns = parseFountainDialogue(validFountain)
        expect(turns.length).toBe(3)
        expect(turns[0].speaker).toBe('ELIAS')
        expect(turns[0].dialogueText).toContain('Keep your hand off the brass')
        expect(turns[1].speaker).toBe('TORVIN')
        expect(turns[1].dialogueText).toBe(
            "I told you twice, Elias. We're losing the seal.",
        )
        expect(turns[2].speaker).toBe('ELIAS')
        expect(turns[2].dialogueText).toBe('Then hold the gasket!')
    })

    it('passes verbatim parity assertion cleanly when prose and AST lines match character-for-character', () => {
        const report = assertVerbatimParity(validFountain, validAstLines)
        expect(report.ok).toBe(true)
        expect(report.totalLinesFountain).toBe(3)
        expect(report.totalLinesAst).toBe(3)
        expect(report.mismatches.length).toBe(0)
        expect(report.t0Spend).toBe('$0.00')
    })

    it('fails closed with PARITY_COUNT_MISMATCH when line counts diverge', () => {
        const truncatedAst = [validAstLines[0], validAstLines[1]] // Missing 3rd line

        expect(() => {
            assertVerbatimParity(validFountain, truncatedAst)
        }).toThrowError(/PARITY_COUNT_MISMATCH/)
    })

    it('fails closed with PARITY_TEXT_MISMATCH on a single character or contraction divergence', () => {
        const divergentAst = [
            validAstLines[0],
            'I told you twice, Elias. We are losing the seal.', // Contraction "We're" altered to "We are"
            validAstLines[2],
        ]

        expect(() => {
            assertVerbatimParity(validFountain, divergentAst)
        }).toThrowError(/PARITY_TEXT_MISMATCH at line 2/)
    })

    it('halts pipeline execution cleanly via enforceParityGate at T0 = $0.00', async () => {
        const mismatchedAst = [
            validAstLines[0],
            'A completely fabricated line.',
            validAstLines[2],
        ]

        const result = await enforceParityGate(validFountain, mismatchedAst)
        expect(result.ok).toBe(false)
        expect(result.errorCode).toBe('PARITY_TEXT_MISMATCH')
        expect(result.error).toContain('PARITY_TEXT_MISMATCH at line 2')
    })

    it('asserts 100% pure 7-bit ASCII compliance across 34.abstractsyntaxtree.unit', () => {
        const dir = path.resolve(packageRoot, '34.abstractsyntaxtree.unit')
        const scanDir = (target: string) => {
            const entries = fs.readdirSync(target, { withFileTypes: true })
            for (const entry of entries) {
                const full = path.join(target, entry.name)
                if (entry.isDirectory()) {
                    scanDir(full)
                } else if (entry.name.endsWith('.ts')) {
                    const content = fs.readFileSync(full, 'utf8')
                    // eslint-disable-next-line no-control-regex
                    const match = content.match(/[\u0080-\uFFFF]/)
                    expect(match).toBeNull()
                }
            }
        }
        scanDir(dir)
    })
})
