import Cuda from './fce/cuda.interface.js'

export class CudaModel implements Cuda {
    idx: string = '27.cuda.unit'
    zeroVramEnforced: boolean = false
    gpuOverrideActive: boolean = false
}
