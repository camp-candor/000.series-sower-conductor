import { Action } from '../99.core/interface/action.interface.js'
import CanonBit from './fce/canon.bit.js'

export const INIT_CANON = '[Canon action] Init Canon'
export class InitCanon implements Action {
    readonly type = INIT_CANON
    constructor(public bale: CanonBit) {}
}

export const LOAD_CANON_AND_FREEZE = '[Canon action] Load Canon And Freeze'
export class LoadCanonAndFreeze implements Action {
    readonly type = LOAD_CANON_AND_FREEZE
    constructor(public bale: CanonBit) {}
}

export type Actions = InitCanon | LoadCanonAndFreeze
