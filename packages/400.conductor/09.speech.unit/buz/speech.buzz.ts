import { SpeechModel } from '../speech.model.js'
import SpeechBit from '../fce/speech.bit.js'
import {
    SpeechGenerationRequest,
    DialogueSynthesisItem,
    StemSynthesisReceipt,
    SceneSpeechReceipt,
} from '../fce/speech.interface.js'
import { SpeechGenerationRequestSchema } from '../val/speech.val.js'
import State from '../../99.core/state.js'
import { execFile } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'

export const buildCliArgs = (
    scriptPath: string,
    item: DialogueSynthesisItem,
    outputPath: string,
    engine: string,
    seriesId: string,
): string[] => {
    const args: string[] = [
        scriptPath,
        '--engine',
        engine,
        '--character',
        item.speaker_id,
        '--series',
        seriesId,
        '--text',
        item.dialogue_text,
        '--output',
        outputPath,
    ]

    if (item.dsp_modifiers) {
        args.push(
            '--pitch-shift',
            String(item.dsp_modifiers.effective_pitch_semitones ?? 0.0),
            '--formant-warp',
            String(item.dsp_modifiers.effective_formant_warping ?? 1.0),
            '--breathiness',
            String(item.dsp_modifiers.effective_breathiness_multiplier ?? 1.0),
            '--pause-multiplier',
            String(item.dsp_modifiers.pause_frequency_multiplier ?? 1.0),
            '--vocal-fry',
            String(item.dsp_modifiers.effective_vocal_fry_density ?? 0.0),
        )
    }

    return args
}

export const verifyZeroByteSentinel = (filePath: string): boolean => {
    if (!fs.existsSync(filePath)) return false
    const stats = fs.statSync(filePath)
    if (stats.size < 1024) return false

    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(12)
    fs.readSync(fd, buffer, 0, 12, 0)
    fs.closeSync(fd)

    const riff = buffer.subarray(0, 4).toString('ascii')
    const wave = buffer.subarray(8, 12).toString('ascii')
    return riff === 'RIFF' && wave === 'WAVE'
}

export const pollFileStabilization = async (
    stagingPath: string,
    maxTimeoutMs = 45000,
    pollIntervalMs = 200,
): Promise<number> => {
    const startTime = Date.now()
    let lastSize = -1
    let stableTicks = 0

    while (Date.now() - startTime < maxTimeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))

        if (fs.existsSync(stagingPath)) {
            const currentSize = fs.statSync(stagingPath).size
            if (currentSize > 0 && currentSize === lastSize) {
                stableTicks++
                if (stableTicks >= 2) {
                    return currentSize
                }
            } else {
                stableTicks = 0
                lastSize = currentSize
            }
        }
    }

    throw new Error(
        `SYNTHESIS_TIMEOUT_BREACH: File failed to stabilize within ${maxTimeoutMs}ms`,
    )
}

export const synthesizeSingleLineWithRetry = async (
    item: DialogueSynthesisItem,
    outputDir: string,
    engine: string,
    seriesId: string,
    sceneId: string,
): Promise<StemSynthesisReceipt> => {
    const lineStart = Date.now()
    const filename = item.output_filename || `${sceneId}_${item.line_id}.wav`
    const finalPath = path.resolve(outputDir, filename)
    const stagingPath = `${finalPath}.tmp`

    let attempt = 0
    const maxAttempts = 3
    let lastError: Error | null = null

    while (attempt < maxAttempts) {
        attempt++
        try {
            if (fs.existsSync(stagingPath)) {
                try {
                    fs.unlinkSync(stagingPath)
                } catch {}
            }

            if (global.LIBRARY) {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> [SPAWN] (${attempt}/${maxAttempts}) Invoking python synthesize.py for line [${item.line_id}] (Speaker: ${item.speaker_id})`,
                })
            }

            const scriptPath = path.resolve('synthesize.py')
            const args = buildCliArgs(
                scriptPath,
                item,
                stagingPath,
                engine,
                seriesId,
            )

            await new Promise<void>((resolve, reject) => {
                execFile(
                    'python',
                    args,
                    {
                        env: {
                            ...process.env,
                            CUDA_VISIBLE_DEVICES: '',
                            OMP_NUM_THREADS: '4',
                        },
                        timeout: 40000,
                    },
                    (error) => {
                        if (error) reject(error)
                        else resolve()
                    },
                )
            })

            const confirmedSize = await pollFileStabilization(stagingPath)

            if (global.LIBRARY) {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> [POLL] Staging inode detected (${confirmedSize} bytes)... Stabilized.`,
                })
            }

            if (global.LIBRARY) {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> [POLL] Staging inode detected (${confirmedSize} bytes)... Stabilized.`,
                })
            }

            if (!verifyZeroByteSentinel(stagingPath)) {
                throw new Error(
                    'ZERO_BYTE_POISON_BREACH: Header validation failed or size < 1024 bytes',
                )
            }

            fs.renameSync(stagingPath, finalPath)

            const fileBuffer = fs.readFileSync(finalPath)
            const sha256 = crypto
                .createHash('sha256')
                .update(fileBuffer)
                .digest('hex')
            const durationMs =
                Math.round(((confirmedSize - 44) / (48000 * 1 * 2)) * 1000) ||
                1000

            if (global.LIBRARY) {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> [ATOMIC-COMMIT] [OK] Committed [${filename}] (${confirmedSize} bytes, SHA: ${sha256.substring(0, 8)}...)`,
                })
            }

            return {
                ok: true,
                line_id: item.line_id,
                speaker_id: item.speaker_id,
                target_path: finalPath,
                byte_size: confirmedSize,
                sha256,
                duration_ms: durationMs,
                execution_ms: Date.now() - lineStart,
                attempts: attempt,
            }
        } catch (err: any) {
            lastError = err
            if (fs.existsSync(stagingPath)) {
                try {
                    fs.unlinkSync(stagingPath)
                } catch {}
            }

            if (attempt < maxAttempts) {
                const backoffMs = 100 * Math.pow(2, attempt - 1)
                if (global.LIBRARY) {
                    await global.LIBRARY.hunt(
                        '[Console action] Update Console',
                        {
                            idx: 'cns00',
                            src: `:: [RETRY] Line [${item.line_id}] failed attempt ${attempt}. Backing off for ${backoffMs}ms: ${err.message}`,
                        },
                    )
                }
                await new Promise((resolve) => setTimeout(resolve, backoffMs))
            }
        }
    }

    const failMsg = lastError ? lastError.message : 'Unknown synthesis failure'
    if (global.LIBRARY) {
        await global.LIBRARY.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: `:: [FAIL] Exhausted all ${maxAttempts} attempts for line [${item.line_id}]: ${failMsg}`,
        })
    }

    return {
        ok: false,
        line_id: item.line_id,
        speaker_id: item.speaker_id,
        target_path: finalPath,
        byte_size: 0,
        sha256: '',
        duration_ms: 0,
        execution_ms: Date.now() - lineStart,
        attempts: attempt,
        error: failMsg,
    }
}

export const initSpeech = (cpy: SpeechModel, bal: SpeechBit, ste: State) => {
    if (bal.slv != null) {
        bal.slv({ spcBit: { idx: 'init-speech', val: 1 } })
    }
    return cpy
}

export const updateSpeech = (cpy: SpeechModel, bal: SpeechBit, ste: State) => {
    if (bal.slv != null) {
        bal.slv({ spcBit: { idx: 'update-speech' } })
    }
    return cpy
}

export const executeSceneSpeech = async (
    cpy: SpeechModel,
    bal: SpeechBit,
    ste: State,
) => {
    cpy.isProcessing = true
    try {
        if (!bal.dat?.request) {
            throw new Error('MISSING_REQUEST: dat.request payload is required')
        }

        const validatedReq = SpeechGenerationRequestSchema.parse(
            bal.dat.request,
        ) as SpeechGenerationRequest
        const outputDir = path.resolve(
            validatedReq.output_directory || 'public/audio/dialogue',
        )
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }

        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [SPEECH] Commencing Scene Audio Synthesis for [${validatedReq.scene_id}] (${validatedReq.items.length} lines) via [${validatedReq.engine}]`,
            })
        }

        const receipts: StemSynthesisReceipt[] = []
        for (const item of validatedReq.items) {
            const receipt = await synthesizeSingleLineWithRetry(
                item,
                outputDir,
                validatedReq.engine,
                validatedReq.series_id,
                validatedReq.scene_id,
            )
            receipts.push(receipt)
            if (receipt.ok) {
                cpy.totalStemsSynthesized++
            }
        }

        const successfulStems = receipts.filter((r) => r.ok).length
        const failedStems = receipts.filter((r) => !r.ok).length

        const sceneReceipt: SceneSpeechReceipt = {
            ok: failedStems === 0,
            scene_id: validatedReq.scene_id,
            total_lines: validatedReq.items.length,
            successful_stems: successfulStems,
            failed_stems: failedStems,
            stems: receipts,
            error:
                failedStems > 0
                    ? `${failedStems} stem(s) failed during execution`
                    : undefined,
        }

        cpy.lastSceneReceipt = sceneReceipt
        cpy.isProcessing = false

        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [SPEECH] [OK] Scene [${validatedReq.scene_id}] Completed: ${successfulStems}/${validatedReq.items.length} stems synthesized successfully`,
            })
        }

        if (bal.slv != null) {
            bal.slv({
                spcBit: {
                    idx: 'execute-scene-speech-success',
                    dat: { receipt: sceneReceipt },
                },
            })
        }
    } catch (err: any) {
        cpy.isProcessing = false
        const errorMsg = err.message || String(err)

        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `:: [SPEECH] [FAIL] Scene Speech Execution faulted: ${errorMsg}`,
            })
        }

        if (bal.slv != null) {
            bal.slv({
                spcBit: {
                    idx: 'execute-scene-speech-error',
                    src: errorMsg,
                },
            })
        }
    }

    return cpy
}

export const verifyNonSilentWavPcm = (
    filePath: string,
): {
    readonly ok: boolean
    readonly rms: number
    readonly peak: number
    readonly sampleCount: number
} => {
    try {
        const buffer = fs.readFileSync(filePath)
        if (buffer.length <= 44)
            return { ok: false, rms: 0, peak: 0, sampleCount: 0 }
        const dataBuffer = buffer.subarray(44)
        const sampleCount = dataBuffer.length / 2
        let sumSq = 0
        let peak = 0
        for (let i = 0; i < dataBuffer.length; i += 2) {
            const sample = dataBuffer.readInt16LE(i)
            sumSq += sample * sample
            const abs = Math.abs(sample)
            if (abs > peak) peak = abs
        }
        const rms = Math.sqrt(sumSq / sampleCount)
        const ok = rms > 50 && peak <= 32767 && sampleCount > 0
        return { ok, rms, peak, sampleCount }
    } catch {
        return { ok: false, rms: 0, peak: 0, sampleCount: 0 }
    }
}
