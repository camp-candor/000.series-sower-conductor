import {
  SceneContextPayload,
  CompiledAttentionSandwich,
  MruBeatNode,
} from './sandwich.interface.js';

export default interface AstBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    payload?: SceneContextPayload;
    compiled?: CompiledAttentionSandwich;
    mruNodes?: MruBeatNode[];
    mruOutput?: string;
  };
  slv?: Function;
}
