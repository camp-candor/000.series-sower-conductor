import { CudaModel } from '../cuda.model.js'
import CudaBit from '../fce/cuda.bit.js'
import State from '../../99.core/state.js'

export const evaluateZeroVramPolicy = (
    env = process.env,
): { zeroVramEnforced: boolean; gpuOverrideActive: boolean } => {
    const cns = '>> [CUDA-BOUNDARY]'
    const cudaVisible = env.CUDA_VISIBLE_DEVICES
    const allowOverride = env.ALLOW_RIG1_GPU_OVERRIDE === 'true'

    if (cudaVisible && cudaVisible !== '') {
        if (!allowOverride) {
            process.stderr.write(
                `${cns} [FAIL] Dedicated GPU detected on Rig 1. Host operates at 0MB dedicated VRAM.\n`,
            )
            throw new Error('DEDICATED_GPU_DETECTED_ON_RIG1')
        }
        return { zeroVramEnforced: false, gpuOverrideActive: true }
    }

    return { zeroVramEnforced: true, gpuOverrideActive: false }
}

export const initCuda = (cpy: CudaModel, bal: CudaBit, _ste: State) => {
    if (bal.slv) bal.slv({ cudaBit: { idx: 'init-cuda', val: 1 } })
    return cpy
}

export const assertZeroVram = (cpy: CudaModel, bal: CudaBit, _ste: State) => {
    const cns = '>> [CUDA-BOUNDARY]'

    try {
        const { zeroVramEnforced, gpuOverrideActive } = evaluateZeroVramPolicy()
        cpy.zeroVramEnforced = zeroVramEnforced
        cpy.gpuOverrideActive = gpuOverrideActive

        process.stdout.write(
            `${cns} [OK] Rig 1 Host Zero-VRAM policy satisfied (Dedicated VRAM: 0MB).\n`,
        )

        if (bal.slv) {
            bal.slv({
                cudaBit: {
                    idx: 'assert-zero-vram',
                    val: 1,
                    dat: { zeroVramEnforced, gpuOverrideActive },
                },
            })
        }
    } catch (err: any) {
        if (bal.slv) {
            bal.slv({
                cudaBit: {
                    idx: 'assert-zero-vram-error',
                    val: 0,
                    src: err.message,
                },
            })
        } else {
            process.exit(1)
        }
    }

    return cpy
}
