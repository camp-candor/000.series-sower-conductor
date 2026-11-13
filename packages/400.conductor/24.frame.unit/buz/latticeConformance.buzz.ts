import { FrameModel } from '../frame.model.js'
import type FrameBit from '../fce/frame.bit.js'
import type {
    CadenceConfig,
    LatticeAllocation,
    ShotLatticeRequest,
    LatticeConformanceResult,
} from '../fce/frame.interface.js'
import type State from '../../99.core/state.js'

export const DEFAULT_CADENCE: CadenceConfig = {
    cadenceMode: 'CONFIG_B_24FPS',
    nativeFps: 24,
}

/**
 * Evaluates the strict round-up causal 4n+1 3D VAE lattice formula for a single shot:
 * n = ceil((N_raw - 1) / 4)
 * N_diff = 4n + 1
 * tail_slack = N_diff - N_raw >= 0
 */
export const calculateLatticeAllocation = (
    shotId: string,
    targetDeliveryFrames: number,
    config: CadenceConfig = DEFAULT_CADENCE,
): LatticeAllocation => {
    if (targetDeliveryFrames <= 0) {
        return {
            shot_id: shotId,
            target_delivery_frames: 0,
            native_fps: config.nativeFps,
            raw_native_frames: 0,
            conformed_diffusion_frames: 1, // Minimum lattice floor 4(0)+1
            tail_slack_frames: 1,
            lattice_index_n: 0,
            temporal_efficiency_pct: 0,
            conforms_to_4n_plus_1: true,
            cadence_mode: config.cadenceMode,
        }
    }

    // 1. Calculate raw native frame count based on cadence configuration
    let rawNativeFrames = targetDeliveryFrames
    if (config.cadenceMode === 'CONFIG_A_12FPS') {
        rawNativeFrames = Math.ceil(targetDeliveryFrames / 2.0)
    } else if (config.cadenceMode === 'CONFIG_C_16FPS') {
        rawNativeFrames = Math.ceil((targetDeliveryFrames / 24.0) * 16.0)
    }

    // 2. Strict Round-Up Causal 4n+1 Latent Lattice Formula
    const n = Math.ceil((rawNativeFrames - 1) / 4.0)
    const conformedDiffusionFrames = 4 * n + 1
    const tailSlackFrames = conformedDiffusionFrames - rawNativeFrames

    // Assert (N_diff - 1) % 4 === 0
    const conformsTo4nPlus1 = (conformedDiffusionFrames - 1) % 4 === 0
    const temporalEfficiencyPct = Number(
        ((rawNativeFrames / conformedDiffusionFrames) * 100).toFixed(2),
    )

    return {
        shot_id: shotId,
        target_delivery_frames: targetDeliveryFrames,
        native_fps: config.nativeFps,
        raw_native_frames: rawNativeFrames,
        conformed_diffusion_frames: conformedDiffusionFrames,
        tail_slack_frames: tailSlackFrames,
        lattice_index_n: n,
        temporal_efficiency_pct: temporalEfficiencyPct,
        conforms_to_4n_plus_1: conformsTo4nPlus1,
        cadence_mode: config.cadenceMode,
    }
}

export const conformFrameLattice = async (
    cpy: FrameModel,
    bal: FrameBit,
    ste?: State,
): Promise<FrameModel> => {
    const requests: ShotLatticeRequest[] = bal.dat?.latticeRequest || []

    const emit = async (msg: string) => {
        if (ste && typeof ste.hunt === 'function') {
            await ste
                .hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
                .catch(() => {})
        }
    }

    if (!requests || requests.length === 0) {
        const errorMsg = 'LATTICE_ERROR: Missing or empty lattice requests'
        await emit(`:: [LATTICE:FAIL] ${errorMsg}`)
        if (bal.slv) {
            bal.slv({
                frmBit: {
                    idx: 'conform-frame-lattice-fail',
                    val: -1,
                    dat: {
                        latticeResult: {
                            ok: false,
                            allocations: [],
                            total_delivery_frames: 0,
                            total_diffusion_frames: 0,
                            total_tail_slack_frames: 0,
                            mean_efficiency_pct: 0,
                            error: errorMsg,
                        },
                    },
                },
            })
        }
        return cpy
    }

    await emit(
        `>> [LATTICE:INIT] Conforming ${requests.length} shot(s) to 4n+1 3D causal VAE stride...`,
    )

    const allocations: LatticeAllocation[] = []
    let totalDelivery = 0
    let totalDiffusion = 0
    let totalSlack = 0
    let sumEfficiency = 0

    for (const req of requests) {
        const alloc = calculateLatticeAllocation(
            req.shot_id,
            req.target_frames,
            req.cadence_config || DEFAULT_CADENCE,
        )

        allocations.push(alloc)
        totalDelivery += alloc.target_delivery_frames
        totalDiffusion += alloc.conformed_diffusion_frames
        totalSlack += alloc.tail_slack_frames
        sumEfficiency += alloc.temporal_efficiency_pct

        await emit(
            `>> [LATTICE] [${alloc.shot_id}]: N=${alloc.target_delivery_frames}f -> VAE=${alloc.conformed_diffusion_frames}f (n=${alloc.lattice_index_n}, slack=${alloc.tail_slack_frames}f, eff=${alloc.temporal_efficiency_pct}%)`,
        )
    }

    const meanEfficiency = Number(
        (sumEfficiency / allocations.length).toFixed(2),
    )
    await emit(
        `>> [LATTICE:OK] Conformed ${allocations.length} shots: ${totalDelivery} delivery frames -> ${totalDiffusion} VAE frames (${totalSlack} slack frames, mean eff: ${meanEfficiency}%)`,
    )

    const result: LatticeConformanceResult = {
        ok: true,
        allocations,
        total_delivery_frames: totalDelivery,
        total_diffusion_frames: totalDiffusion,
        total_tail_slack_frames: totalSlack,
        mean_efficiency_pct: meanEfficiency,
    }

    if (bal.slv) {
        bal.slv({
            frmBit: {
                idx: 'conform-frame-lattice-success',
                val: totalDiffusion,
                dat: { latticeResult: result },
            },
        })
    }

    return cpy
}
