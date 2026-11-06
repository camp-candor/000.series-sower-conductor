import { Action } from '../99.core/interface/action.interface.js'
import EdgeBridgeBit from './fce/edgebridge.bit.js'

export const INIT_EDGEBRIDGE = '[Edgebridge action] Init Edgebridge'
export class InitEdgebridge implements Action {
    readonly type = INIT_EDGEBRIDGE
    constructor(public bale: EdgeBridgeBit) {}
}

export const ACQUIRE_HARDWARE_LEASE =
    '[Edgebridge action] Acquire Hardware Lease'
export class AcquireHardwareLease implements Action {
    readonly type = ACQUIRE_HARDWARE_LEASE
    constructor(public bale: EdgeBridgeBit) {}
}

export const RENEW_LEASE_HEARTBEAT = '[Edgebridge action] Renew Lease Heartbeat'
export class RenewLeaseHeartbeat implements Action {
    readonly type = RENEW_LEASE_HEARTBEAT
    constructor(public bale: EdgeBridgeBit) {}
}

export const TRANSMIT_ASSEMBLY_RECEIPT =
    '[Edgebridge action] Transmit Assembly Receipt'
export class TransmitAssemblyReceipt implements Action {
    readonly type = TRANSMIT_ASSEMBLY_RECEIPT
    constructor(public bale: EdgeBridgeBit) {}
}

export const TOGGLE_TARGET_ENDPOINT =
    '[Edgebridge action] Toggle Target Endpoint'
export class ToggleTargetEndpoint implements Action {
    readonly type = TOGGLE_TARGET_ENDPOINT
    constructor(public bale: EdgeBridgeBit) {}
}

export const POLL_STALENESS_STATUS = '[Edgebridge action] Poll Staleness Status'
export class PollStalenessStatus implements Action {
    readonly type = POLL_STALENESS_STATUS
    constructor(public bale: EdgeBridgeBit) {}
}

export type Actions =
    | InitEdgebridge
    | AcquireHardwareLease
    | RenewLeaseHeartbeat
    | TransmitAssemblyReceipt
    | ToggleTargetEndpoint
    | PollStalenessStatus
