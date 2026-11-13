import { FrameModel } from '../frame.model.js'
import type FrameBit from '../fce/frame.bit.js'
import type {
    TimelineShotInput,
    TiledShot,
    TimelineTilingResult,
} from '../fce/frame.interface.js'
import type State from '../../99.core/state.js'

export const MASTER_FPS = 24.0
export const SINGLE_FRAME_MS = 1000 / MASTER_FPS // 41.666666666666664 ms

/**
 * Calculates local discrete ceiling frame allocation with mandatory 1-frame minimum boundary clamp.
 * target_frames = max(1, ceil((duration_ms / 1000) * 24))
 */
export const calculateCeilingFrames = (durationMs: number): number => {
    return Math.max(1, Math.ceil((durationMs / 1000) * MASTER_FPS))
}

/**
 * Quantizes a series of audio stem durations into an absolute contiguous timeline using
 * cumulative millisecond sums, preventing rounding drift from compounding across cuts.
 *
 * Start_k = ceil( (sum_{i<k} D_i) / 1000 * 24 )
 * End_k   = ceil( (sum_{i<=k} D_i) / 1000 * 24 ) - 1
 */
export const tileTimelineFrames = async (
    cpy: FrameModel,
    bal: FrameBit,
    ste?: State,
): Promise<FrameModel> => {
    const inputs: TimelineShotInput[] = bal.dat?.tilingRequest || []

    const emit = async (msg: string) => {
        if (ste && typeof ste.hunt === 'function') {
            await ste
                .hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
                .catch(() => {})
        } else if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: msg,
            }).catch(() => {})
        }
    }

    if (!inputs || inputs.length === 0) {
        const errorMsg = 'TILING_ERROR: Empty or missing timeline shot inputs'
        await emit(`:: [TILING:FAIL] ${errorMsg}`)
        if (bal.slv) {
            bal.slv({
                frmBit: {
                    idx: 'tile-timeline-frames-fail',
                    val: -1,
                    dat: {
                        tilingResult: {
                            ok: false,
                            shots: [],
                            total_duration_ms: 0,
                            total_frames: 0,
                            drift_ms: 0,
                            contiguous: false,
                            error: errorMsg,
                        },
                    },
                },
            })
        }
        return cpy
    }

    await emit(
        `>> [TILING:INIT] Quantizing timeline for ${inputs.length} shot(s) at 24.0 fps...`,
    )

    const tiledShots: TiledShot[] = []
    let cumulativeMs = 0
    let isContiguous = true

    for (let k = 0; k < inputs.length; k++) {
        const item = inputs[k]
        const rawDurationMs = Number.isFinite(item.duration_ms)
            ? item.duration_ms
            : 0

        // Sub-frame duration clamp safeguard: enforce 1 frame minimum (41.67 ms)
        const effectiveDurationMs =
            rawDurationMs < SINGLE_FRAME_MS ? SINGLE_FRAME_MS : rawDurationMs

        // Start frame is cumulative sum before this shot
        const startFrame = Math.ceil((cumulativeMs / 1000) * MASTER_FPS)

        // End frame is cumulative sum including this shot, minus 1
        const nextCumulativeMs = cumulativeMs + effectiveDurationMs
        const endFrame = Math.ceil((nextCumulativeMs / 1000) * MASTER_FPS) - 1

        const frameCount = endFrame - startFrame + 1
        const allocatedDurationMs = (frameCount / MASTER_FPS) * 1000
        const tailSlackMs = allocatedDurationMs - rawDurationMs

        // Check contiguity with preceding shot
        if (k > 0) {
            const prev = tiledShots[k - 1]
            if (prev.to_frame + 1 !== startFrame) {
                isContiguous = false
            }
        }

        tiledShots.push({
            shot_id: item.shot_id,
            duration_ms: rawDurationMs,
            padded_duration_ms: effectiveDurationMs,
            from_frame: startFrame,
            to_frame: endFrame,
            frame_count: frameCount,
            tail_slack_ms: Number(tailSlackMs.toFixed(3)),
        })

        cumulativeMs = nextCumulativeMs
    }

    const totalFrames =
        tiledShots.length > 0
            ? tiledShots[tiledShots.length - 1].to_frame + 1
            : 0
    const totalVideoDurationMs = (totalFrames / MASTER_FPS) * 1000
    const driftMs = Number((totalVideoDurationMs - cumulativeMs).toFixed(3))

    await emit(
        `>> [TILING:OK] Tiled ${tiledShots.length} shot(s) -> Total: ${totalFrames} frames (${cumulativeMs.toFixed(1)}ms audio)`,
    )
    await emit(
        `>> [TILING:DRIFT] Bounded drift: ${driftMs}ms (Contiguous: ${isContiguous})`,
    )

    const result: TimelineTilingResult = {
        ok: isContiguous,
        shots: tiledShots,
        total_duration_ms: cumulativeMs,
        total_frames: totalFrames,
        drift_ms: driftMs,
        contiguous: isContiguous,
    }

    if (bal.slv) {
        bal.slv({
            frmBit: {
                idx: 'tile-timeline-frames-success',
                val: totalFrames,
                dat: { tilingResult: result },
            },
        })
    }

    return cpy
}
