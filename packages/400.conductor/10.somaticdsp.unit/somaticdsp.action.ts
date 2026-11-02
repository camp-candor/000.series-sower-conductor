import { Action } from '../99.core/interface/action.interface'
import SomaticdspBit from './fce/somaticdsp.bit'

// Somaticdsp actions

export const INIT_SOMATICDSP = '[Somaticdsp action] Init Somaticdsp'
export class InitSomaticdsp implements Action {
    readonly type = INIT_SOMATICDSP
    constructor(public bale: SomaticdspBit) {}
}

export const UPDATE_SOMATICDSP = '[Somaticdsp action] Update Somaticdsp'
export class UpdateSomaticdsp implements Action {
    readonly type = UPDATE_SOMATICDSP
    constructor(public bale: SomaticdspBit) {}
}

export type Actions = InitSomaticdsp | UpdateSomaticdsp
