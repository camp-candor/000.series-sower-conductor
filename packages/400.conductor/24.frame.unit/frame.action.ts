import { Action } from '../99.core/interface/action.interface'
import FrameBit from './fce/frame.bit'

// Frame actions

export const INIT_FRAME = '[Frame action] Init Frame'
export class InitFrame implements Action {
    readonly type = INIT_FRAME
    constructor(public bale: FrameBit) {}
}

export const UPDATE_FRAME = '[Frame action] Update Frame'
export class UpdateFrame implements Action {
    readonly type = UPDATE_FRAME
    constructor(public bale: FrameBit) {}
}

export type Actions = InitFrame | UpdateFrame
