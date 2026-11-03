import { Model } from '../../99.core/interface/model.interface.js'

export default interface Cuda extends Model {
    zeroVramEnforced: boolean
    gpuOverrideActive: boolean
}
