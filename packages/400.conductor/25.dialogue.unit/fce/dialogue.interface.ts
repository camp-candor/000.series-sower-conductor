import { Model } from '../../99.core/interface/model.interface.js'
import DialogueBit from './dialogue.bit.js'

export default interface Dialogue extends Model {
    idx: string
    dialogueBitList: DialogueBit[]
    dialogueBits: Record<string, unknown>
}
