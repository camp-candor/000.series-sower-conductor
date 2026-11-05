export interface ExtractedDialogueTurn {
    speaker: string
    dialogueText: string
    lineNumber: number
}

export interface ParityLineMismatch {
    lineIndex: number
    speaker: string
    fountainNormalized: string
    astNormalized: string
}

export interface ParityComparisonReport {
    ok: boolean
    totalLinesFountain: number
    totalLinesAst: number
    mismatches: ParityLineMismatch[]
    latencyMs: number
    t0Spend: '$0.00'
}

export interface ParityGateResult {
    ok: boolean
    report: ParityComparisonReport
    error?: string
    errorCode?:
        'PARITY_COUNT_MISMATCH' | 'PARITY_TEXT_MISMATCH' | 'PARITY_CHECK_FAILED'
}
