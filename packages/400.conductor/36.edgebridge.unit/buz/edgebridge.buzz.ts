import { EdgebridgeModel } from '../edgebridge.model.js'
import EdgebridgeBit from '../fce/edgebridge.bit.js'
import State from '../../99.core/state.js'
import {
    HardwareLeaseReceipt,
    TelemetryIngressPayload,
} from '../fce/edgebridge.interface.js'
import { TelemetryIngressPayloadSchema } from '../val/edgebridge.val.js'

export const initEdgebridge = (
    cpy: EdgebridgeModel,
    bal: EdgebridgeBit,
    ste: State,
) => {
    if (bal.slv != null) {
        bal.slv({
            edgBit: { idx: 'init-edgebridge', val: 1 },
            edgebridgeBit: { idx: 'init-edgebridge', val: 1 },
        })
    }
    return cpy
}

export const updateEdgebridge = (
    cpy: EdgebridgeModel,
    bal: EdgebridgeBit,
    ste: State,
) => {
    if (bal.slv != null) {
        bal.slv({
            edgBit: { idx: 'update-edgebridge', val: 1 },
            edgebridgeBit: { idx: 'update-edgebridge', val: 1 },
        })
    }
    return cpy
}

export const acquireHardwareLease = async (
    cpy: EdgebridgeModel,
    bal: EdgebridgeBit,
    ste: State,
): Promise<EdgebridgeModel> => {
    const sceneId = bal.src || bal.dat?.sceneId || 'ep01_sc01'
    const ttlMs = bal.val || bal.dat?.leasePayload?.ttlMs || 30000
    const endpoint = cpy.targetEndpoint || cpy.activeTargetUrl

    try {
        let receipt: HardwareLeaseReceipt
        if (endpoint && endpoint.startsWith('http')) {
            try {
                const res = await fetch(`${endpoint}/api/lease/acquire`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sceneId, ttlMs }),
                })

                if (res.status === 409) {
                    throw new Error('HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH')
                }
                if (!res.ok) {
                    throw new Error(
                        `HTTP ${res.status}: Failed to acquire edge lease`,
                    )
                }
                receipt = (await res.json()) as HardwareLeaseReceipt
            } catch (fetchErr: any) {
                if (
                    fetchErr.message &&
                    fetchErr.message.includes(
                        'HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH',
                    )
                ) {
                    throw fetchErr
                }
                // Local fallback loopback emulation when edge service is offline
                receipt = {
                    leaseId: `lease_${sceneId}_${Date.now()}`,
                    epoch: 1,
                    sceneId,
                    grantedAtMs: Date.now(),
                    ttlMs,
                    status: 'ACTIVE',
                }
            }
        } else {
            // Local fallback loopback emulation
            receipt = {
                leaseId: `lease_${sceneId}_${Date.now()}`,
                epoch: 1,
                sceneId,
                grantedAtMs: Date.now(),
                ttlMs,
                status: 'ACTIVE',
            }
        }

        cpy.activeLease = receipt

        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `>> [EDGE] [OK] Acquired Hardware Lease: ${receipt.leaseId} (Epoch: ${receipt.epoch})`,
            })
        }

        if (bal.slv != null) {
            bal.slv({
                edgBit: {
                    idx: 'acquire-hardware-lease-success',
                    dat: { receipt },
                },
                edgebridgeBit: {
                    idx: 'acquire-hardware-lease',
                    val: 1,
                    dat: {
                        receipt,
                        epoch: receipt.epoch,
                        jobId: bal.src || sceneId,
                        expiresAtMs: receipt.grantedAtMs + ttlMs,
                    },
                },
            })
        }
    } catch (err: any) {
        if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: `:: [EDGE] [FAIL] Lease acquisition failed: ${err.message}`,
            })
        }
        if (bal.slv != null) {
            bal.slv({
                edgBit: {
                    idx: 'acquire-hardware-lease-error',
                    src: err.message,
                },
                edgebridgeBit: {
                    idx: 'acquire-hardware-lease-error',
                    src: err.message,
                    val: 0,
                },
            })
        }
    }

    return cpy
}

export const syncEdgeTelemetry = async (
    cpy: EdgebridgeModel,
    bal: EdgebridgeBit,
    ste: State,
): Promise<EdgebridgeModel> => {
    try {
        if (!bal.dat?.telemetry) {
            throw new Error('MISSING_TELEMETRY: dat.telemetry is required')
        }
        const validated = TelemetryIngressPayloadSchema.parse(
            bal.dat.telemetry,
        ) as TelemetryIngressPayload
        const endpoint = cpy.targetEndpoint || cpy.activeTargetUrl

        if (endpoint && endpoint.startsWith('http')) {
            try {
                await fetch(`${endpoint}/api/telemetry/audio`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validated),
                })
            } catch {
                // Offline emulation: accepted locally
            }
        }

        if (bal.slv != null) {
            bal.slv({
                edgBit: {
                    idx: 'sync-edge-telemetry-success',
                    val: 1,
                },
                edgebridgeBit: {
                    idx: 'sync-edge-telemetry-success',
                    val: 1,
                },
            })
        }
    } catch (err: any) {
        if (bal.slv != null) {
            bal.slv({
                edgBit: {
                    idx: 'sync-edge-telemetry-error',
                    src: err.message,
                },
                edgebridgeBit: {
                    idx: 'sync-edge-telemetry-error',
                    src: err.message,
                    val: 0,
                },
            })
        }
    }
    return cpy
}

export {
    renewLeaseHeartbeat,
    toggleTargetEndpoint,
    pollStalenessStatus,
    transmitAssemblyReceipt,
} from './00.edgebridge.buzz.js'
