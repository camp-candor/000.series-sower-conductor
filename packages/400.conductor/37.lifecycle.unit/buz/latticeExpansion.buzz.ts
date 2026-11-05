import {
    CadenceConfig,
    LatticeAllocationResult,
} from '../fce/lattice.interface.js'

export function conformToDiffusionLattice(
    targetFrames: number,
    config: CadenceConfig = { cadenceMode: 'CONFIG_B_24FPS', nativeFps: 24 },
): LatticeAllocationResult {
    if (targetFrames <= 0) {
        return {
            targetDeliveryFrames: 0,
            nativeFps: config.nativeFps,
            rawNativeFrames: 0,
            conformedDiffusionFrames: 1, // Minimum lattice integer 4(0)+1
            paddingFrames: 1,
            latticeIndexN: 0,
            conformsTo4nPlus1: true,
            cadenceMode: config.cadenceMode,
        }
    }

    // 1. Calculate raw native frames based on cadence mode
    let rawNativeFrames = targetFrames
    if (config.cadenceMode === 'CONFIG_A_12FPS') {
        rawNativeFrames = Math.ceil(targetFrames / 2.0)
    } else if (config.cadenceMode === 'CONFIG_C_16FPS') {
        rawNativeFrames = Math.ceil((targetFrames / 24.0) * 16.0)
    }

    // 2. Strict Round-Up Causal 4n+1 Latent Lattice Formula
    // n = ceil((N_raw - 1) / 4)
    // N_diff = 4n + 1
    const n = Math.ceil((rawNativeFrames - 1) / 4.0)
    const conformedDiffusionFrames = 4 * n + 1
    const paddingFrames = conformedDiffusionFrames - rawNativeFrames

    // Assert (N_diff - 1) % 4 === 0
    const conformsTo4nPlus1 = (conformedDiffusionFrames - 1) % 4 === 0

    return {
        targetDeliveryFrames: targetFrames,
        nativeFps: config.nativeFps,
        rawNativeFrames,
        conformedDiffusionFrames,
        paddingFrames,
        latticeIndexN: n,
        conformsTo4nPlus1,
        cadenceMode: config.cadenceMode,
    }
}
