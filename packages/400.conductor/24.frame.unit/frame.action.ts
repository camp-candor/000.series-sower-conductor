import { Action } from '../99.core/interface/action.interface.js'
import FrameBit from './fce/frame.bit.js'

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

export const QUANTIZE_ACOUSTIC_CLOCK = '[Frame action] Quantize Acoustic Clock'
export class QuantizeAcousticClock implements Action {
    readonly type = QUANTIZE_ACOUSTIC_CLOCK
    constructor(public bale: FrameBit) {}
}

export type Actions = InitFrame | UpdateFrame | QuantizeAcousticClock
