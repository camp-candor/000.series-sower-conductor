import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { SpeechModel } from '../speech.model.js'
import SpeechBit from '../fce/speech.bit.js'
import {
    TTSGenerationRequest,
    AudioStemResult,
    SceneSynthesisResult,
} from '../fce/speech.interface.js'
import State from '../../99.core/state.js'
import type {
    DialogueLine,
    SceneAST,
} from '../../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

export const mapDialogueLineToTTSRequest = (
    line: DialogueLine,
): TTSGenerationRequest => {
    const s = line.somatic_dsp
    const m = line.mru_directive

    const basePitchShiftSemitones = Number(
        (s.pitch_shift_cents / 100).toFixed(2),
    )
    const breathinessPauseMultiplier = Number(
        (1.0 + 2.5 * (s.breathiness_bps / 10000)).toFixed(3),
    )
    const pause_frequency_multiplier = Number(
        (0.5 + 2.5 * (m.intensity_bps / 10000)).toFixed(3),
    )
    const vocalFryDensity = Number(
        (s.gain_attenuation_bps > 5000 ? 0.45 : 0.0).toFixed(2),
    )
    const tonePacing = 1.0

    return {
        character: line.speaker_id,
        text: line.dialogue_clean_ascii,
        emotion: line.emotional_tag,
        tonePacing,
        dsp_modifiers: {
            basePitchShiftSemitones,
            formantWarpingFactor: 1.0,
            breathinessPauseMultiplier,
            vocalFryDensity,
            pause_frequency_multiplier,
        },
    }
}

export const synthesizeSingleLineWithRetry = async (
    line: DialogueLine,
    endpointUrl: string,
    outputDir: string,
    maxRetries = 3,
    fetchFn: typeof fetch = fetch,
): Promise<AudioStemResult> => {
    const cns = '>> [SPEECH]'
    const reqPayload = mapDialogueLineToTTSRequest(line)
    const targetWavPath = path.resolve(
        process.cwd(),
        path.join(outputDir, `${line.line_id}.wav`),
    )
    const tmpWavPath = `${targetWavPath}.tmp`

    const dir = path.dirname(targetWavPath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    let attempt = 0
    let lastError: Error | null = null

    while (attempt < maxRetries) {
        attempt++
        try {
            const res = await fetchFn(
                `${endpointUrl.replace(/\/$/, '')}/generate`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqPayload),
                },
            )

            if (!res.ok) {
                throw new Error(
                    `TTS_HTTP_ERROR: Server returned status ${res.status}`,
                )
            }

            const buffer = Buffer.from(await res.arrayBuffer())

            if (buffer.length === 0) {
                throw new Error('TTS_EMPTY_BUFFER: Synthesis returned 0 bytes')
            }

            // Verify basic RIFF WAVE header
            const header = buffer.subarray(0, 4).toString('ascii')
            const format = buffer.subarray(8, 12).toString('ascii')
            if (header !== 'RIFF' || format !== 'WAVE') {
                throw new Error(
                    `TTS_INVALID_WAV: Expected RIFF/WAVE header, received ${header}/${format}`,
                )
            }

            // Atomic write: write to .tmp, then atomic rename
            fs.writeFileSync(tmpWavPath, buffer)
            fs.renameSync(tmpWavPath, targetWavPath)

            const hash = crypto
                .createHash('sha256')
                .update(buffer)
                .digest('hex')

            // Approximate PCM duration from standard 48kHz, 24-bit, 1-channel PCM (144,000 bytes/sec)
            const dataSize = Math.max(0, buffer.length - 44)
            const durationMs = Math.round((dataSize / 144000) * 1000)

            process.stdout.write(
                `${cns} [OK] Stem ${line.line_id} synthesized (${buffer.length} bytes, ~${durationMs}ms).\n`,
            )

            return {
                lineId: line.line_id,
                speakerId: line.speaker_id,
                filePath: targetWavPath,
                durationMs,
                sha256: hash,
            }
        } catch (err: any) {
            lastError = err
            if (fs.existsSync(tmpWavPath)) {
                try {
                    fs.unlinkSync(tmpWavPath)
                } catch (_e) {}
            }
            process.stderr.write(
                `${cns} [WARN] Attempt ${attempt}/${maxRetries} failed for line ${line.line_id}: ${err.message}\n`,
            )
            if (attempt < maxRetries) {
                await new Promise((r) =>
                    setTimeout(r, 100 * Math.pow(2, attempt)),
                )
            }
        }
    }

    throw new Error(
        `TTS_LINE_SYNTHESIS_FAILED: Line ${line.line_id} failed after ${maxRetries} attempts: ${lastError?.message}`,
    )
}

export const initSpeech = (cpy: SpeechModel, bal: SpeechBit, _ste: State) => {
    if (bal.slv) bal.slv({ speechBit: { idx: 'init-speech', val: 1 } })
    return cpy
}

export const synthesizeLineAudio = async (
    cpy: SpeechModel,
    bal: SpeechBit,
    _ste: State,
) => {
    const line = bal.dat?.line as DialogueLine
    const endpointUrl = bal.src || cpy.endpointUrl
    const outputDir = bal.dat?.outputDir || cpy.scratchOutputDir
    const fetchFn = bal.dat?.fetchFn || fetch

    try {
        const result = await synthesizeSingleLineWithRetry(
            line,
            endpointUrl,
            outputDir,
            3,
            fetchFn,
        )
        cpy.totalStemsSynthesized += 1

        if (bal.slv) {
            bal.slv({
                speechBit: {
                    idx: 'synthesize-line-audio',
                    val: 1,
                    src: line.line_id,
                    dat: result,
                },
            })
        }
    } catch (err: any) {
        if (bal.slv) {
            bal.slv({
                speechBit: {
                    idx: 'synthesize-line-audio-error',
                    val: 0,
                    src: err.message,
                },
            })
        } else {
            throw err
        }
    }
    return cpy
}

export const synthesizeSceneAudio = async (
    cpy: SpeechModel,
    bal: SpeechBit,
    _ste: State,
) => {
    const cns = '>> [SPEECH]'
    const sceneAst = bal.dat?.ast as SceneAST
    const endpointUrl = bal.src || cpy.endpointUrl
    const outputDir = bal.dat?.outputDir || cpy.scratchOutputDir
    const fetchFn = bal.dat?.fetchFn || fetch

    if (!sceneAst || !sceneAst.lines || sceneAst.lines.length === 0) {
        const errMsg = 'INVALID_AST: Scene contains zero lines for synthesis'
        process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
        if (bal.slv)
            return bal.slv({
                speechBit: {
                    idx: 'synthesize-scene-audio-error',
                    val: 0,
                    src: errMsg,
                },
            })
        throw new Error(errMsg)
    }

    const stems: AudioStemResult[] = []

    for (const line of sceneAst.lines) {
        try {
            const stem = await synthesizeSingleLineWithRetry(
                line,
                endpointUrl,
                outputDir,
                3,
                fetchFn,
            )
            stems.push(stem)
            cpy.totalStemsSynthesized += 1
        } catch (err: any) {
            process.stderr.write(
                `${cns} [FAIL] Scene synthesis aborted on line ${line.line_id}: ${err.message}\n`,
            )
            if (bal.slv) {
                return bal.slv({
                    speechBit: {
                        idx: 'synthesize-scene-audio-error',
                        val: 0,
                        src: err.message,
                        dat: { completedStems: stems },
                    },
                })
            }
            throw err
        }
    }

    const sceneResult: SceneSynthesisResult = {
        sceneId: sceneAst.scene_id,
        totalLines: stems.length,
        stems,
        completedAtMs: Date.now(),
    }

    cpy.lastSceneResult = sceneResult
    process.stdout.write(
        `${cns} [OK] Scene ${sceneAst.scene_id} audio complete (${stems.length} stems synthesized).\n`,
    )

    if (bal.slv) {
        bal.slv({
            speechBit: {
                idx: 'synthesize-scene-audio',
                val: 1,
                src: sceneAst.scene_id,
                dat: sceneResult,
            },
        })
    }
    return cpy
}
