import { ParityGateResult } from '../fce/parity.interface.js'
import { assertVerbatimParity } from './assertParity.buzz.js'

export async function enforceParityGate(
    fountainText: string,
    astDialogueLines: string[],
): Promise<ParityGateResult> {
    try {
        const report = assertVerbatimParity(fountainText, astDialogueLines)

        process.stdout.write(
            `>> [PARITY] [OK] Verbatim parity verified across ${report.totalLinesAst} dialogue turns (${report.latencyMs}ms at T0 = $0.00).\n`,
        )

        return {
            ok: true,
            report,
        }
    } catch (err: any) {
        const errorCode =
            err.name === 'PARITY_COUNT_MISMATCH'
                ? 'PARITY_COUNT_MISMATCH'
                : err.name === 'PARITY_TEXT_MISMATCH'
                  ? 'PARITY_TEXT_MISMATCH'
                  : 'PARITY_CHECK_FAILED'

        process.stderr.write(
            `>> [PARITY] [FAIL] ${errorCode}: ${err.message}\n` +
                `>> [HALT] Execution halted at T0 = $0.00 before audio synthesis or GPU allocation.\n`,
        )

        return {
            ok: false,
            report: {
                ok: false,
                totalLinesFountain: 0,
                totalLinesAst: astDialogueLines.length,
                mismatches: [],
                latencyMs: 0,
                t0Spend: '$0.00',
            },
            error: err.message,
            errorCode,
        }
    }
}
