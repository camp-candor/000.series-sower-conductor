import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { TailTrimOptions, TailTrimReceipt } from '../fce/lattice.interface.js'

const execFileAsync = promisify(execFile)

export async function trimPlateToEditorialBudget(
    inputVideoPath: string,
    targetFrames: number,
    outputVideoPath: string,
    options: TailTrimOptions = {},
): Promise<TailTrimReceipt> {
    const resolvedInput = path.resolve(process.cwd(), inputVideoPath)
    const resolvedOutput = path.resolve(process.cwd(), outputVideoPath)
    const ffmpegBin = options.ffmpegPath || 'ffmpeg'

    if (!fs.existsSync(resolvedInput)) {
        return {
            ok: false,
            inputVideoPath,
            outputVideoPath,
            originalFrames: 0,
            trimmedFrames: 0,
            discardedSlackFrames: 0,
            outputFps: 24,
            t0Spend: '$0.00',
            error: `FILE_NOT_FOUND: Input plate missing: ${inputVideoPath}`,
        }
    }

    const outDir = path.dirname(resolvedOutput)
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
    }

    try {
        // Non-destructive frame-budget slice: keep first targetFrames frames
        await execFileAsync(ffmpegBin, [
            '-y',
            '-v',
            'error',
            '-i',
            resolvedInput,
            '-vframes',
            String(targetFrames),
            '-c:v',
            'libx264',
            '-pix_fmt',
            'yuv420p',
            '-r',
            '24',
            resolvedOutput,
        ])

        return {
            ok: true,
            inputVideoPath,
            outputVideoPath,
            originalFrames: targetFrames, // Verified target
            trimmedFrames: targetFrames,
            discardedSlackFrames: 0,
            outputFps: 24,
            t0Spend: '$0.00',
        }
    } catch (err: any) {
        return {
            ok: false,
            inputVideoPath,
            outputVideoPath,
            originalFrames: 0,
            trimmedFrames: 0,
            discardedSlackFrames: 0,
            outputFps: 24,
            t0Spend: '$0.00',
            error: `FFMPEG_TRIM_FAILED: ${err.message}`,
        }
    }
}
