import { Model } from '../../99.core/interface/model.interface.js'

export default interface Conductor extends Model {
    status: string
    totalScenesProcessed: number
}
