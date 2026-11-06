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

export const CHAIN_MASTER_SCENE_LIFECYCLE = '[Lifecycle action] Chain Master Scene Lifecycle';
export class ChainMasterSceneLifecycle implements Action {
  readonly type = CHAIN_MASTER_SCENE_LIFECYCLE;
  constructor(public bale: LifecycleBit) {}
}

export type Actions = InitLifecycle | UpdateLifecycle | ChainMasterSceneLifecycle;
