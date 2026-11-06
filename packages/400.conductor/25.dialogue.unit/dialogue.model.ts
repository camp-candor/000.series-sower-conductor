import Dialogue from './fce/dialogue.interface.js'
import DialogueBit from './fce/dialogue.bit.js'

export class DialogueModel implements Dialogue {
    idx: string = '25.dialogue.unit'
    dialogueBitList: DialogueBit[] = []
    dialogueBits: Record<string, unknown> = {}
}
