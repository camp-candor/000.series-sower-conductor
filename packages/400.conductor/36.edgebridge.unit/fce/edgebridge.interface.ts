import { Model } from '../../99.core/interface/model.interface.js'

export type EdgeConnectionStatus =
    | 'DISCONNECTED'
    | 'CONNECTING'
    | 'CONNECTED'
    | 'LEASE_ACTIVE'
    | 'LEASE_QUEUED'
    | 'ERROR'

export interface HardwareLeaseToken {
    leaseId: string
    jobId: string
    assignedRole: 'broker' | 'conductor' | 'artist'
    epoch: number
    grantedAtMs: number
    ttlMs: number
    expiresAtMs: number
    idempotencyKey?: string
}

export interface AcquireLeasePayload {
    sceneId: string
    jobId: string
    artistId?: string
    ttlMs?: number
    idempotencyKey?: string
}

export interface HardwareLeaseReceipt {
    ok: boolean
    status: 'LEASE_GRANTED' | 'QUEUED' | 'REJECTED'
    leaseId: string | null
    epoch: number | null
    queuePosition?: number
    idempotencyKey: string
    grantedAtMs?: number
    expiresAtMs?: number
    ttlMs: number
    error?: string
}

export interface EdgeBridgeConfig {
    localEndpoint: string
    cloudEndpoint: string
    heartbeatIntervalMs: number
    leaseTtlMs: number
}

export interface EdgeCoordinationStatus {
    activeTargetUrl: string
    connectionStatus: EdgeConnectionStatus
    currentEpoch: number
    hasActiveLease: boolean
    lastHeartbeatMs: number
}

export default interface EdgeBridge extends Model {
    idx: string
    activeTargetUrl: string
    connectionStatus: EdgeConnectionStatus
    currentEpoch: number
    activeLease: HardwareLeaseToken | null
    lastReceiptAck: string | null
    lastHeartbeatMs: number
}
