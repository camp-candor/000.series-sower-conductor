import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
    TtsClientOptions,
    SynthesizedStemReceipt,
} from '../fce/acousticClock.interface.js'

export const EMPTY_SHA256 =
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

export function validateWavFileIntegrity(filePath: string): {
    valid: boolean
    sizeBytes: number
    sha256: string
    error?: string
} {
    if (!fs.existsSync(filePath)) {
        return {
            valid: false,
            sizeBytes: 0,
            sha256: '',
            error: 'FILE_NOT_FOUND',
        }
    }

    const stats = fs.statSync(filePath)
    if (stats.size < 1024) {
        return {
            valid: false,
            sizeBytes: stats.size,
            sha256: '',
            error: 'ZERO_BYTE_POISON: File size below 1024 bytes threshold',
        }
    }

    const fileBuffer = fs.readFileSync(filePath)
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    if (hash === EMPTY_SHA256) {
        return {
            valid: false,
            sizeBytes: stats.size,
            sha256: hash,
            error: 'EMPTY_HASH_SENTINEL: File matches SHA-256 empty digest',
        }
    }

    // Inspect standard RIFF PCM header markers
    const riffMarker = fileBuffer.toString('ascii', 0, 4)
    const waveMarker = fileBuffer.toString('ascii', 8, 12)
    if (riffMarker !== 'RIFF' || waveMarker !== 'WAVE') {
        return {
            valid: false,
            sizeBytes: stats.size,
            sha256: hash,
            error: 'CORRUPT_HEADER: Missing valid RIFF/WAVE header markers',
        }
    }

    return {
        valid: true,
        sizeBytes: stats.size,
        sha256: hash,
    }
}

export async function synthesizeDialogueStem(
    text: string,
    speakerId: string,
    outputWavPath: string,
    options: TtsClientOptions = {},
): Promise<SynthesizedStemReceipt> {
    const daemonUrl = options.daemonUrl || 'http://127.0.0.1:8000/synthesize'
    const timeoutMs = options.timeoutMs || 15000
    const maxRetries = options.maxRetries || 2

    let attempt = 0
    let lastError: Error | null = null

    while (attempt <= maxRetries) {
        attempt++
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        try {
            const response = await fetch(daemonUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Role': 'conductor_rig_01',
                },
                body: JSON.stringify({
                    text,
                    speaker_id: speakerId,
                    output_format: 'wav_48k',
                }),
                signal: controller.signal,
            })

            clearTimeout(timer)

            if (!response.ok) {
                throw new Error(
                    `TTS_DAEMON_HTTP_${response.status}: ${response.statusText}`,
                )
            }

            const arrayBuffer = await response.arrayBuffer()
            const resolvedDir = path.dirname(
                path.resolve(process.cwd(), outputWavPath),
            )
            if (!fs.existsSync(resolvedDir)) {
                fs.mkdirSync(resolvedDir, { recursive: true })
            }

            // POSIX safe staging to temporary inode before rename
            const tmpPath = `${path.resolve(process.cwd(), outputWavPath)}.tmp_${crypto.randomUUID()}`
            fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer))
            fs.renameSync(tmpPath, path.resolve(process.cwd(), outputWavPath))

            const validation = validateWavFileIntegrity(
                path.resolve(process.cwd(), outputWavPath),
            )
            if (!validation.valid) {
                throw new Error(validation.error)
            }

            // Duration estimate from 48 kHz 16-bit mono PCM payload: bytes / (48000 * 2) * 1000
            const pcmDataBytes = Math.max(0, validation.sizeBytes - 44)
            const estimatedDurationMs = Math.round(
                (pcmDataBytes / (48000 * 2)) * 1000,
            )

            return {
                ok: true,
                wavPath: outputWavPath,
                durationMs: estimatedDurationMs,
                fileSizeBytes: validation.sizeBytes,
                sampleRate: 48000,
                channels: 1,
                sha256: validation.sha256,
                t0Spend: '$0.00',
            }
        } catch (err: any) {
            clearTimeout(timer)
            lastError = err
            if (attempt <= maxRetries) {
                // Exponential backoff wait
                await new Promise((resolve) =>
                    setTimeout(resolve, 50 * Math.pow(2, attempt)),
                )
            }
        }
    }

    return {
        ok: false,
        wavPath: outputWavPath,
        durationMs: 0,
        fileSizeBytes: 0,
        sampleRate: 48000,
        channels: 1,
        sha256: '',
        t0Spend: '$0.00',
        error: lastError ? lastError.message : 'UNKNOWN_TTS_ERROR',
    }
}
