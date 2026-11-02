import { Action } from '../99.core/interface/action.interface'
import ContinuityBit from './fce/continuity.bit'

// Continuity actions

export const INIT_CONTINUITY = '[Continuity action] Init Continuity'
export class InitContinuity implements Action {
    readonly type = INIT_CONTINUITY
    constructor(public bale: ContinuityBit) {}
}

export const UPDATE_CONTINUITY = '[Continuity action] Update Continuity'
export class UpdateContinuity implements Action {
    readonly type = UPDATE_CONTINUITY
    constructor(public bale: ContinuityBit) {}
}

export type Actions = InitContinuity | UpdateContinuity
