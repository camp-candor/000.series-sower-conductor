import { Action } from '../99.core/interface/action.interface.js';
import AbstractSyntaxTreeBit from './fce/abstractsyntaxtree.bit.js';

export const INIT_ABSTRACTSYNTAXTREE = '[Abstractsyntaxtree action] Init Abstractsyntaxtree';
export class InitAbstractsyntaxtree implements Action {
  readonly type = INIT_ABSTRACTSYNTAXTREE;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const UPDATE_ABSTRACTSYNTAXTREE = '[Abstractsyntaxtree action] Update Abstractsyntaxtree';
export class UpdateAbstractsyntaxtree implements Action {
  readonly type = UPDATE_ABSTRACTSYNTAXTREE;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const PARSE_SCENE_AST = '[Abstractsyntaxtree action] Parse Scene AST';
export class ParseSceneAst implements Action {
  readonly type = PARSE_SCENE_AST;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const VERIFY_AST_PARITY = '[Abstractsyntaxtree action] Verify AST Parity';
export class VerifyAstParity implements Action {
  readonly type = VERIFY_AST_PARITY;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export type Actions =
  | InitAbstractsyntaxtree
  | UpdateAbstractsyntaxtree
  | ParseSceneAst
  | VerifyAstParity;
