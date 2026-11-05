import { SceneAST, AstValidationReceipt } from './sceneAst.interface.js';

export default interface AbstractSyntaxTreeBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    rawJson?: string;
    filePath?: string;
    ast?: SceneAST;
    receipt?: AstValidationReceipt;
  };
  slv?: Function;
}
