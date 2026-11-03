import { Action } from '../99.core/interface/action.interface.js'
import CudaBit from './fce/cuda.bit.js'

export const INIT_CUDA = '[Cuda action] Init Cuda'
export class InitCuda implements Action {
    readonly type = INIT_CUDA
    constructor(public bale: CudaBit) {}
}

export const ASSERT_ZERO_VRAM = '[Cuda action] Assert Zero Vram'
export class AssertZeroVram implements Action {
    readonly type = ASSERT_ZERO_VRAM
    constructor(public bale: CudaBit) {}
}

export type Actions = InitCuda | AssertZeroVram
