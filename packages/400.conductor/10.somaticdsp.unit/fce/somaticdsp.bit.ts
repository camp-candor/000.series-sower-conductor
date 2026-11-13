import type {
    CharacterSomaticState,
    DialogueSomaticInput,
    SomaticDspReceipt,
} from './somaticdsp.interface.js'

export default interface SomaticdspBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        somaticState?: CharacterSomaticState
        somaticInput?: DialogueSomaticInput
        receipt?: SomaticDspReceipt
        input?: any
        characterId?: string
        dialogueText?: string
        payload?: any
    }
    slv?: (result: { smcBit: Partial<SomaticdspBit> }) => void
}
