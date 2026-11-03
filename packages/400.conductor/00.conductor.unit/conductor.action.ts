import { Action } from '../99.core/interface/action.interface.js';
import ConductorBit from './fce/conductor.bit.js';

export const INIT_CONDUCTOR = '[Conductor action] Init Conductor';
export class InitConductor implements Action {
  readonly type = INIT_CONDUCTOR;
  constructor(public bale: ConductorBit) {}
}

export const RUN_SCENE_LIFECYCLE = '[Conductor action] Run Scene Lifecycle';
export class RunSceneLifecycle implements Action {
  readonly type = RUN_SCENE_LIFECYCLE;
  constructor(public bale: ConductorBit) {}
}

export type Actions = InitConductor | RunSceneLifecycle;

