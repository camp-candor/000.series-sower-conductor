import AbstractSyntaxTreeBit from './abstractsyntaxtree.bit.js';
import { SceneAST, AstValidationReceipt } from './sceneAst.interface.js';

export default interface AbstractSyntaxTree {
  idx: string;
  currentAst?: SceneAST;
  lastReceipt?: AstValidationReceipt;
  astBits: Record<string, AbstractSyntaxTreeBit>;
}
