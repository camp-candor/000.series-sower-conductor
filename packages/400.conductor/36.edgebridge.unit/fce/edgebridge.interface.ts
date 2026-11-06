import { Model } from '../../99.core/interface/model.interface.js'

export interface HardwareLeaseReceipt {
    leaseId: string
    epoch: number
    sceneId: string
    grantedAtMs: number
    ttlMs: number
    status: 'ACTIVE' | 'EXPIRED' | 'ZOMBIE_REJECTED'
}

export interface LegacyHardwareLeaseReceipt {
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

export interface TelemetryIngressPayload {
    sceneId: string
    episodeId: string
    currentStage: string
    totalFrames: number
    vramUsedMb: 0
    lockfileSha256: string | null
    epoch: number
}

export default interface Edgebridge {
    idx: string
    activeLease: HardwareLeaseReceipt | null
    targetEndpoint: string
    isHeartbeatActive: boolean
    activeTargetUrl?: string
    connectionStatus?: any
    currentEpoch?: number
    lastReceiptAck?: string | null
    lastHeartbeatMs?: number
}

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

export type EdgeBridge = Edgebridge
