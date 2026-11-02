import { Action } from '../99.core/interface/action.interface'
import LogisticsBit from './fce/logistics.bit'

// Logistics actions

export const INIT_LOGISTICS = '[Logistics action] Init Logistics'
export class InitLogistics implements Action {
    readonly type = INIT_LOGISTICS
    constructor(public bale: LogisticsBit) {}
}

export const UPDATE_LOGISTICS = '[Logistics action] Update Logistics'
export class UpdateLogistics implements Action {
    readonly type = UPDATE_LOGISTICS
    constructor(public bale: LogisticsBit) {}
}

export type Actions = InitLogistics | UpdateLogistics
