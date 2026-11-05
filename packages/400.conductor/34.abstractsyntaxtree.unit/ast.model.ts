import AstState, {
    CompiledAttentionSandwich,
} from './fce/sandwich.interface.js'
import { ParityGateResult } from './fce/parity.interface.js'

export class AstModel implements AstState {
    idx: string = '34.abstractsyntaxtree.unit'
    status: string = 'IDLE'
    lastCompiledPrompt: string | null = null
    lastSandwich: CompiledAttentionSandwich | null = null
    lastParityResult: ParityGateResult | null = null
    lastActionTimestamp: number = 0
}
