import { Action } from '../99.core/interface/action.interface.js'
import VramBit from './fce/vram.bit.js'

// Vram actions

export const INIT_VRAM = '[Vram action] Init Vram'
export class InitVram implements Action {
    readonly type = INIT_VRAM
    constructor(public bale: VramBit) {}
}

export const UPDATE_VRAM = '[Vram action] Update Vram'
export class UpdateVram implements Action {
    readonly type = UPDATE_VRAM
    constructor(public bale: VramBit) {}
}

export type Actions = InitVram | UpdateVram
