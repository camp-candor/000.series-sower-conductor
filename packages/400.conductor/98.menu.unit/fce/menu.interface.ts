import { Model } from '../../99.core/interface/model.interface.js'

export default interface Menu extends Model {
    activeSelection: string
    lastActionTimestamp: number
    statusMessage: string
}
