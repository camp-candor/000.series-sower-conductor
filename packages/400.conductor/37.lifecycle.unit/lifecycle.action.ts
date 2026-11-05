import { Action } from '../99.core/interface/action.interface.js';
import LifecycleBit from './fce/lifecycle.bit.js';

export const INIT_LIFECYCLE = '[Lifecycle action] Init Lifecycle';
export class InitLifecycle implements Action {
  readonly type = INIT_LIFECYCLE;
  constructor(public bale: LifecycleBit) {}
}

export const UPDATE_LIFECYCLE = '[Lifecycle action] Update Lifecycle';
export class UpdateLifecycle implements Action {
  readonly type = UPDATE_LIFECYCLE;
  constructor(public bale: LifecycleBit) {}
}

export const RUN_INCEPTION_PREFLIGHT = '[Lifecycle action] Run Inception Preflight';
export class RunInceptionPreflight implements Action {
  readonly type = RUN_INCEPTION_PREFLIGHT;
  constructor(public bale: LifecycleBit) {}
}

export const QUANTIZE_ACOUSTIC_CLOCK = '[Lifecycle action] Quantize Acoustic Clock';
export class QuantizeAcousticClock implements Action {
  readonly type = QUANTIZE_ACOUSTIC_CLOCK;
  constructor(public bale: LifecycleBit) {}
}

export type Actions =
  | InitLifecycle
  | UpdateLifecycle
  | RunInceptionPreflight
  | QuantizeAcousticClock;
