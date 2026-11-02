import { Action } from '../99.core/interface/action.interface'
import CudaBit from './fce/cuda.bit'

// Cuda actions

export const INIT_CUDA = '[Cuda action] Init Cuda'
export class InitCuda implements Action {
    readonly type = INIT_CUDA
    constructor(public bale: CudaBit) {}
}

export const UPDATE_CUDA = '[Cuda action] Update Cuda'
export class UpdateCuda implements Action {
    readonly type = UPDATE_CUDA
    constructor(public bale: CudaBit) {}
}

export type Actions = InitCuda | UpdateCuda
