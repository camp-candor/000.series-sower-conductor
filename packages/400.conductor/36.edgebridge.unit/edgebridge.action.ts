import { Action } from '../99.core/interface/action.interface.js'
import EdgebridgeBit from './fce/edgebridge.bit.js'

export const INIT_EDGEBRIDGE = '[Edgebridge action] Init Edgebridge'
export class InitEdgebridge implements Action {
    readonly type = INIT_EDGEBRIDGE
    constructor(public bale: EdgebridgeBit) {}
}

export const UPDATE_EDGEBRIDGE = '[Edgebridge action] Update Edgebridge'
export class UpdateEdgebridge implements Action {
    readonly type = UPDATE_EDGEBRIDGE
    constructor(public bale: EdgebridgeBit) {}
}

export const ACQUIRE_HARDWARE_LEASE =
    '[Edgebridge action] Acquire Hardware Lease'
export class AcquireHardwareLease implements Action {
    readonly type = ACQUIRE_HARDWARE_LEASE
    constructor(public bale: EdgebridgeBit) {}
}

export const SYNC_EDGE_TELEMETRY = '[Edgebridge action] Sync Edge Telemetry'
export class SyncEdgeTelemetry implements Action {
    readonly type = SYNC_EDGE_TELEMETRY
    constructor(public bale: EdgebridgeBit) {}
}

export const RENEW_LEASE_HEARTBEAT = '[Edgebridge action] Renew Lease Heartbeat'
export class RenewLeaseHeartbeat implements Action {
    readonly type = RENEW_LEASE_HEARTBEAT
    constructor(public bale: EdgebridgeBit) {}
}

export const TRANSMIT_ASSEMBLY_RECEIPT =
    '[Edgebridge action] Transmit Assembly Receipt'
export class TransmitAssemblyReceipt implements Action {
    readonly type = TRANSMIT_ASSEMBLY_RECEIPT
    constructor(public bale: EdgebridgeBit) {}
}

export const TOGGLE_TARGET_ENDPOINT =
    '[Edgebridge action] Toggle Target Endpoint'
export class ToggleTargetEndpoint implements Action {
    readonly type = TOGGLE_TARGET_ENDPOINT
    constructor(public bale: EdgebridgeBit) {}
}

export const POLL_STALENESS_STATUS = '[Edgebridge action] Poll Staleness Status'
export class PollStalenessStatus implements Action {
    readonly type = POLL_STALENESS_STATUS
    constructor(public bale: EdgebridgeBit) {}
}

export type Actions =
    | InitEdgebridge
    | UpdateEdgebridge
    | AcquireHardwareLease
    | SyncEdgeTelemetry
    | RenewLeaseHeartbeat
    | TransmitAssemblyReceipt
    | ToggleTargetEndpoint
    | PollStalenessStatus
