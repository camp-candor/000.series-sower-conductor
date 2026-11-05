import { Action } from '../99.core/interface/action.interface.js';
import RemotionBit from './fce/remotion.bit.js';

export const INIT_REMOTION = '[Remotion action] Init Remotion';
export class InitRemotion implements Action {
  readonly type = INIT_REMOTION;
  constructor(public bale: RemotionBit) {}
}

export const UPDATE_REMOTION = '[Remotion action] Update Remotion';
export class UpdateRemotion implements Action {
  readonly type = UPDATE_REMOTION;
  constructor(public bale: RemotionBit) {}
}

export const STAMP_STATIC_COMPOSITION = '[Remotion action] Stamp Static Composition';
export class StampStaticComposition implements Action {
  readonly type = STAMP_STATIC_COMPOSITION;
  constructor(public bale: RemotionBit) {}
}

export const RENDER_SWANGLE = '[Remotion action] Render Swangle';
export class RenderSwangle implements Action {
  readonly type = RENDER_SWANGLE;
  constructor(public bale: RemotionBit) {}
}

export type Actions =
  | InitRemotion
  | UpdateRemotion
  | StampStaticComposition
  | RenderSwangle;
