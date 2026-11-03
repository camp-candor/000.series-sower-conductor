import { Action } from '../99.core/interface/action.interface.js';
import SomaticdspBit from './fce/somaticdsp.bit.js';

export const INIT_SOMATICDSP = '[Somaticdsp action] Init Somaticdsp';
export class InitSomaticdsp implements Action {
  readonly type = INIT_SOMATICDSP;
  constructor(public bale: SomaticdspBit) {}
}

export const TRANSLATE_SOMATIC_DSP = '[Somaticdsp action] Translate Somatic Dsp';
export class TranslateSomaticDsp implements Action {
  readonly type = TRANSLATE_SOMATIC_DSP;
  constructor(public bale: SomaticdspBit) {}
}

export type Actions = InitSomaticdsp | TranslateSomaticDsp;
