import {
    ExtractedDialogueTurn,
    ParityComparisonReport,
    ParityLineMismatch,
} from '../fce/parity.interface.js'
import {
    parseFountainDialogue,
    normalizePunctuation,
} from './fountainTokenizer.buzz.js'

export function assertVerbatimParity(
    fountainProse: string,
    astDialogueLines: string[],
): ParityComparisonReport {
    const startTime = Date.now()
    const extractedFountain: ExtractedDialogueTurn[] =
        parseFountainDialogue(fountainProse)

    // Check 1: Line Count Equality
    if (extractedFountain.length !== astDialogueLines.length) {
        const err = new Error(
            `PARITY_COUNT_MISMATCH: Fountain has ${extractedFountain.length} lines; AST has ${astDialogueLines.length} lines.`,
        )
        err.name = 'PARITY_COUNT_MISMATCH'
        throw err
    }

    const mismatches: ParityLineMismatch[] = []

    // Check 2: Character-for-Character Normalized Text Equality
    for (let i = 0; i < extractedFountain.length; i++) {
        const cleanFountain = normalizePunctuation(
            extractedFountain[i].dialogueText,
        )
        const cleanAst = normalizePunctuation(astDialogueLines[i] || '')

        if (cleanFountain !== cleanAst) {
            mismatches.push({
                lineIndex: i + 1,
                speaker: extractedFountain[i].speaker,
                fountainNormalized: cleanFountain,
                astNormalized: cleanAst,
            })
        }
    }

    if (mismatches.length > 0) {
        const firstMismatch = mismatches[0]
        const err = new Error(
            `PARITY_TEXT_MISMATCH at line ${firstMismatch.lineIndex} (${firstMismatch.speaker}):\n` +
                `Script: "${firstMismatch.fountainNormalized}"\n` +
                `AST:    "${firstMismatch.astNormalized}"`,
        )
        err.name = 'PARITY_TEXT_MISMATCH'
        throw err
    }

    return {
        ok: true,
        totalLinesFountain: extractedFountain.length,
        totalLinesAst: astDialogueLines.length,
        mismatches: [],
        latencyMs: Date.now() - startTime,
        t0Spend: '$0.00',
    }
}
