import {
    SceneContextPayload,
    CompiledAttentionSandwich,
    MruBeatNode,
} from './sandwich.interface.js'
import { ParityGateResult } from './parity.interface.js'

export default interface AstBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        payload?: SceneContextPayload
        compiled?: CompiledAttentionSandwich
        mruNodes?: MruBeatNode[]
        mruOutput?: string
        fountainText?: string
        astDialogueLines?: string[]
        parityResult?: ParityGateResult
    }
    slv?: Function
}
