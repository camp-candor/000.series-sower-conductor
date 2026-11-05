import AbstractSyntaxTree from './fce/abstractsyntaxtree.interface.js';
import AbstractSyntaxTreeBit from './fce/abstractsyntaxtree.bit.js';
import { SceneAST, AstValidationReceipt } from './fce/sceneAst.interface.js';

export class AbstractSyntaxTreeModel implements AbstractSyntaxTree {
  idx: string = '34.abstractsyntaxtree';
  currentAst?: SceneAST;
  lastReceipt?: AstValidationReceipt;
  astBits: Record<string, AbstractSyntaxTreeBit> = {};
}
