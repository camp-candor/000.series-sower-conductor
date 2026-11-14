import { FrameModel } from '../frame.model.js'
import FrameBit from '../fce/frame.bit.js'
import {
    RawStemDuration,
    CausalVaeAllocation,
    QuantizedShot,
    TimelineQuantizationReceipt,
} from '../fce/frame.interface.js'
import { FrameQuantizationRequestSchema } from '../val/frame.val.js'
import State from '../../99.core/state.js'
import { execFile } from 'node:child_process'
import * as fs from 'node:fs'

export const SAMPLES_PER_FRAME = 2000 // 48000 Hz / 24 fps

export const FRAMES_PER_DAY_24 = 86400 * 24

export const frameToSmpteTimecode24 = (
    frameIndex: number,
    startClockHm?: string,
): string => {
    if (!Number.isInteger(frameIndex) || frameIndex < 0) {
        throw new Error(
            `NEGATIVE_FRAME_INDEX: frameIndex [${frameIndex}] invalid`,
        )
    }
    let baseFrames = 0
    if (startClockHm !== undefined) {
        const hm = String(startClockHm).trim()
        const parsed = hm.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
        if (!parsed) {
            throw new Error(
                `INVALID_START_CLOCK: startClockHm [${startClockHm}] must match HH:MM`,
            )
        }
        const hh = Number(parsed[1])
        const mm = Number(parsed[2])
        baseFrames = (hh * 3600 + mm * 60) * 24
    }
    const total = (baseFrames + frameIndex) % FRAMES_PER_DAY_24
    const ff = total % 24
    const totalSeconds = Math.floor(total / 24)
    const ss = totalSeconds % 60
    const mmOut = Math.floor(totalSeconds / 60) % 60
    const hhOut = Math.floor(totalSeconds / 3600) % 24
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(hhOut)}:${pad(mmOut)}:${pad(ss)}:${pad(ff)}`
}

export const extractDurationMsViaFfprobe = async (
    wavPath: string,
    mockDurationMs?: number,
): Promise<number> => {
    if (mockDurationMs !== undefined) return mockDurationMs

    if (!fs.existsSync(wavPath)) {
        throw new Error(
            `FILE_NOT_FOUND: Audio stem does not exist at path: ${wavPath}`,
        )
    }

    return new Promise((resolve, reject) => {
        execFile(
            'ffprobe',
            [
                '-v',
                'error',
                '-show_entries',
                'format=duration',
                '-of',
                'default=noprint_wrappers=1:nokey=1',
                wavPath,
            ],
            (err, stdout) => {
                if (err) {
                    reject(new Error(`FFPROBE_EXEC_FAILED: ${err.message}`))
                    return
                }
                const durationSec = parseFloat(stdout.trim())
                if (isNaN(durationSec) || durationSec <= 0) {
                    reject(
                        new Error(
                            `FFPROBE_PARSE_FAILED: Invalid duration string: ${stdout}`,
                        ),
                    )
                    return
                }
                resolve(Math.round(durationSec * 1000))
            },
        )
    })
}

export const calculateCausalVaeAllocation = (
    rawFrames: number,
): CausalVaeAllocation => {
    const clampedRaw = Math.max(1, rawFrames)
    const nStride = Math.ceil((clampedRaw - 1) / 4)
    const conformedFrames = 4 * nStride + 1
    const paddingSlackFrames = conformedFrames - clampedRaw

    return {
        raw_frames: clampedRaw,
        conformed_frames: conformedFrames,
        padding_slack_frames: paddingSlackFrames,
        n_stride: nStride,
    }
}

export const quantizeShotTimeline = (
    stems: RawStemDuration[],
    startClockHm?: string,
): TimelineQuantizationReceipt => {
    if (!stems || stems.length === 0) {
        throw new Error('TIMELINE_QUANT_EMPTY: Cannot quantize empty stem list')
    }

    const quantizedShots: QuantizedShot[] = []
    let cumulativeMs = 0
    let totalRawMs = 0

    for (let i = 0; i < stems.length; i++) {
        const stem = stems[i]
        totalRawMs += stem.duration_ms

        const fromFrame = Math.ceil((cumulativeMs / 1000) * 24)
        cumulativeMs += stem.duration_ms
        const toFrame = Math.max(
            fromFrame,
            Math.ceil((cumulativeMs / 1000) * 24) - 1,
        )
        const targetFrames = Math.max(1, toFrame - fromFrame + 1)

        const causalVae = calculateCausalVaeAllocation(targetFrames)

        quantizedShots.push({
            shot_id: stem.shot_id,
            duration_ms: stem.duration_ms,
            target_frames: targetFrames,
            from_frame: fromFrame,
            to_frame: toFrame,
            from_timecode: frameToSmpteTimecode24(fromFrame, startClockHm),
            to_timecode: frameToSmpteTimecode24(toFrame, startClockHm),
            sample_offset_start: fromFrame * SAMPLES_PER_FRAME,
            sample_offset_end: (toFrame + 1) * SAMPLES_PER_FRAME,
            causal_vae: causalVae,
        })
    }

    let isContiguous = true
    for (let i = 0; i < quantizedShots.length - 1; i++) {
        if (
            quantizedShots[i].to_frame + 1 !==
            quantizedShots[i + 1].from_frame
        ) {
            isContiguous = false
            break
        }
    }

    const totalFrames = quantizedShots[quantizedShots.length - 1].to_frame + 1
    const videoDurationMs = (totalFrames / 24) * 1000
    const driftMs = Math.abs(videoDurationMs - totalRawMs)

    return {
        ok: isContiguous && driftMs < 41.67,
        total_shots: quantizedShots.length,
        total_duration_ms: totalRawMs,
        total_frames: totalFrames,
        drift_ms: Number(driftMs.toFixed(3)),
        is_contiguous: isContiguous,
        shots: quantizedShots,
    }
}

export const initFrame = (cpy: FrameModel, bal: FrameBit, ste: State) => {
    if (bal.slv != null) bal.slv({ frmBit: { idx: 'init-frame', val: 1 } })
    return cpy
}

export const updateFrame = (cpy: FrameModel, bal: FrameBit, ste: State) => {
    if (bal.slv != null) bal.slv({ frmBit: { idx: 'update-frame' } })
    return cpy
}

export const quantizeAcousticClock = async (
    cpy: FrameModel,
    bal: FrameBit,
    ste: State,
) => {
    try {
        if (!bal.dat?.stems) {
            throw new Error(
                'MISSING_STEMS: dat.stems array is required for timeline quantization',
            )
        }

        const validatedReq = FrameQuantizationRequestSchema.parse({
            stems: bal.dat.stems,
        })
        const receipt = quantizeShotTimeline(
            validatedReq.stems as RawStemDuration[],
        )

        cpy.lastTimelineReceipt = receipt
        cpy.totalQuantizedShots += receipt.total_shots

        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [QUANT] Quantized ${receipt.total_shots} shots: ${receipt.total_frames} frames (${receipt.total_duration_ms}ms) | Drift=${receipt.drift_ms}ms`,
            })
            for (const shot of receipt.shots) {
                await global.LIBRARY.hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: `>> [QUANT] [${shot.shot_id}]: frames=${shot.target_frames} (from=${shot.from_frame}, to=${shot.to_frame}) | VAE=${shot.causal_vae.conformed_frames}f (slack=${shot.causal_vae.padding_slack_frames}f)`,
                })
            }
        }

        if (bal.slv != null) {
            bal.slv({
                frmBit: {
                    idx: 'quantize-acoustic-clock-success',
                    dat: { receipt },
                },
            })
        }
    } catch (err: any) {
        const errorMsg = err.message || String(err)
        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `:: [QUANT] [FAIL] Frame quantization error: ${errorMsg}`,
            })
        }
        if (bal.slv != null) {
            bal.slv({
                frmBit: {
                    idx: 'quantize-acoustic-clock-error',
                    src: errorMsg,
                },
            })
        }
    }

    return cpy
}
