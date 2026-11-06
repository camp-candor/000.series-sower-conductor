import { Action } from '../99.core/interface/action.interface.js'
import LogisticBit from './fce/logistic.bit.js'

export const INIT_LOGISTIC = '[Logistic action] Init Logistic'
export class InitLogistic implements Action {
    readonly type = INIT_LOGISTIC
    constructor(public bale: LogisticBit) {}
}

export const COMPILE_SPOKE_PAYLOAD = '[Logistic action] Compile Spoke Payload'
export class CompileSpokePayload implements Action {
    readonly type = COMPILE_SPOKE_PAYLOAD
    constructor(public bale: LogisticBit) {}
}

export const DISPATCH_SPOKE_PAYLOAD = '[Logistic action] Dispatch Spoke Payload'
export class DispatchSpokePayload implements Action {
    readonly type = DISPATCH_SPOKE_PAYLOAD
    constructor(public bale: LogisticBit) {}
}

export type Actions = InitLogistic | CompileSpokePayload | DispatchSpokePayload
