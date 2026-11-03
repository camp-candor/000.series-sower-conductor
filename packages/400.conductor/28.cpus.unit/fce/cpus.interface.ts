import { Model } from '../../99.core/interface/model.interface.js'

export default interface Cpus extends Model {
    cores: number
    totalMemoryBytes: number
    ffprobeVersion: string
    gitVersion: string
    verified: boolean
}
