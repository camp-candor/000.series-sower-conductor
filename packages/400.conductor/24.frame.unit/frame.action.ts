import { Action } from '../99.core/interface/action.interface.js';
import FrameBit from './fce/frame.bit.js';

export const INIT_FRAME = '[Frame action] Init Frame';
export class InitFrame implements Action {
  readonly type = INIT_FRAME;
  constructor(public bale: FrameBit) {}
}

export const QUANTIZE_STEM_DURATION = '[Frame action] Quantize Stem Duration';
export class QuantizeStemDuration implements Action {
  readonly type = QUANTIZE_STEM_DURATION;
  constructor(public bale: FrameBit) {}
}

export const COMPILE_TIMELINE_BUDGET = '[Frame action] Compile Timeline Budget';
export class CompileTimelineBudget implements Action {
  readonly type = COMPILE_TIMELINE_BUDGET;
  constructor(public bale: FrameBit) {}
}

export type Actions = InitFrame | QuantizeStemDuration | CompileTimelineBudget;
