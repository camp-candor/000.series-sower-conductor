import { Action } from '../99.core/interface/action.interface'
import TelemetryBit from './fce/telemetry.bit'

// Telemetry actions

export const INIT_TELEMETRY = '[Telemetry action] Init Telemetry'
export class InitTelemetry implements Action {
    readonly type = INIT_TELEMETRY
    constructor(public bale: TelemetryBit) {}
}

export const UPDATE_TELEMETRY = '[Telemetry action] Update Telemetry'
export class UpdateTelemetry implements Action {
    readonly type = UPDATE_TELEMETRY
    constructor(public bale: TelemetryBit) {}
}

export type Actions = InitTelemetry | UpdateTelemetry
