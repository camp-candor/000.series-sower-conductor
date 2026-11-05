import { Action } from '../99.core/interface/action.interface.js'
import AbstractSyntaxTreeBit from './fce/abstractsyntaxtree.bit.js'

export const INIT_ABSTRACTSYNTAXTREE =
    '[AbstractSyntaxTree action] Init AbstractSyntaxTree'
export class InitAbstractSyntaxTree implements Action {
    readonly type = INIT_ABSTRACTSYNTAXTREE
    constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const PARSE_SCENE_AST = '[AbstractSyntaxTree action] Parse Scene AST'
export class ParseSceneAST implements Action {
    readonly type = PARSE_SCENE_AST
    constructor(public bale: AbstractSyntaxTreeBit) {}
}

export type Actions = InitAbstractSyntaxTree | ParseSceneAST
