import { Action } from '../99.core/interface/action.interface.js'
import AstBit from './fce/ast.bit.js'

export const INIT_AST = '[AST action] Init AST'
export class InitAst implements Action {
    readonly type = INIT_AST
    constructor(public bale: AstBit) {}
}

export const UPDATE_AST = '[AST action] Update AST'
export class UpdateAst implements Action {
    readonly type = UPDATE_AST
    constructor(public bale: AstBit) {}
}

export const COMPILE_ATTENTION_SANDWICH =
    '[AST action] Compile Attention Sandwich'
export class CompileAttentionSandwich implements Action {
    readonly type = COMPILE_ATTENTION_SANDWICH
    constructor(public bale: AstBit) {}
}

export const COMPILE_SWAIN_MRU = '[AST action] Compile Swain MRU'
export class CompileSwainMru implements Action {
    readonly type = COMPILE_SWAIN_MRU
    constructor(public bale: AstBit) {}
}

export const ASSERT_VERBATIM_PARITY = '[AST action] Assert Verbatim Parity'
export class AssertVerbatimParity implements Action {
    readonly type = ASSERT_VERBATIM_PARITY
    constructor(public bale: AstBit) {}
}

export * from './abstractsyntaxtree.action.js'

export type Actions =
    | InitAst
    | UpdateAst
    | CompileAttentionSandwich
    | CompileSwainMru
    | AssertVerbatimParity
