import { Action } from '../99.core/interface/action.interface.js'
import VramBit from './fce/vram.bit.js'

export const INIT_VRAM = '[Vram action] Init Vram'
export class InitVram implements Action {
    readonly type = INIT_VRAM
    constructor(public bale: VramBit) {}
}

export const EXECUTE_VRAM_HYGIENE = '[Vram action] Execute Vram Hygiene'
export class ExecuteVramHygiene implements Action {
    readonly type = EXECUTE_VRAM_HYGIENE
    constructor(public bale: VramBit) {}
}

export type Actions = InitVram | ExecuteVramHygiene
