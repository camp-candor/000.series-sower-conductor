import crypto from 'node:crypto'
import {
    AcquireLeasePayload,
    LegacyHardwareLeaseReceipt as HardwareLeaseReceipt,
} from '../fce/edgebridge.interface.js'

export interface LeaseRequestOptions {
    targetUrl?: string
    timeoutMs?: number
    mockFetch?: typeof fetch
}

/**
 * Generates an RFC-compliant UUIDv7 string with monotonic millisecond timestamp prefix.
 */
export function generateUuidV7(): string {
    const now = Date.now()
    const randomBytes = crypto.randomBytes(10)

    // 48-bit timestamp
    const timeHex = now.toString(16).padStart(12, '0')

    // version 7 (0b0111)
    const ver = '7'
    const randA = randomBytes.subarray(0, 2).toString('hex').slice(1)

    // variant 1 (0b10xx)
    const varByte = (randomBytes[2] & 0x3f) | 0x80
    const varHex = varByte.toString(16).padStart(2, '0')
    const randB = randomBytes.subarray(3, 10).toString('hex')

    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${ver}${randA}-${varHex}${randB.slice(0, 2)}-${randB.slice(2)}`
}

export async function acquireHardwareLease(
    payload: AcquireLeasePayload,
    options: LeaseRequestOptions = {},
): Promise<HardwareLeaseReceipt> {
    const fetchFn = options.mockFetch || globalThis.fetch
    const baseUrl =
        options.targetUrl ||
        (globalThis as any).agentBaseUrl ||
        'http://127.0.0.1:8787'
    const timeoutMs = options.timeoutMs ?? 5000

    const idempotencyKey = payload.idempotencyKey || generateUuidV7()
    const ttlMs = payload.ttlMs || 30000
    const artistId = payload.artistId || 'conductor_rig_01'

    const requestBody = {
        sceneId: payload.sceneId,
        jobId: payload.jobId,
        artistId,
        idempotencyKey,
        ttlMs,
    }

    const controller = new AbortController()
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const res = await fetchFn(`${baseUrl}/lease/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        })

        clearTimeout(timeoutHandle)

        if (!res) {
            throw new Error(
                'NETWORK_TRANSPORT_ERROR: Empty response from edge gateway',
            )
        }

        if (res.status === 200) {
            const data = (await res.json().catch(() => ({}))) as any
            const receipt: HardwareLeaseReceipt = {
                ok: true,
                status: 'LEASE_GRANTED',
                leaseId: data.leaseId || `lease_${payload.jobId}_${Date.now()}`,
                epoch: typeof data.epoch === 'number' ? data.epoch : 1,
                idempotencyKey,
                grantedAtMs: data.grantedAtMs || Date.now(),
                expiresAtMs: data.expiresAtMs || Date.now() + ttlMs,
                ttlMs,
            }

            process.stdout.write(
                `>> [LEASE] [OK] Granted hardware lease ${receipt.leaseId} (Epoch: ${receipt.epoch}, TTL: ${ttlMs}ms).\n`,
            )
            return receipt
        }

        if (res.status === 202) {
            const data = (await res.json().catch(() => ({}))) as any
            const receipt: HardwareLeaseReceipt = {
                ok: true,
                status: 'QUEUED',
                leaseId: null,
                epoch: null,
                queuePosition:
                    typeof data.queuePosition === 'number'
                        ? data.queuePosition
                        : 1,
                idempotencyKey,
                ttlMs,
            }

            process.stdout.write(
                `>> [LEASE] [QUEUED] Hardware busy; job ${payload.jobId} placed in fair queue (Position: ${receipt.queuePosition}).\n`,
            )
            return receipt
        }

        const errText = await res.text().catch(() => 'UNKNOWN_ERROR')
        const receipt: HardwareLeaseReceipt = {
            ok: false,
            status: 'REJECTED',
            leaseId: null,
            epoch: null,
            idempotencyKey,
            ttlMs,
            error: `HTTP_${res.status}: ${errText}`,
        }

        process.stderr.write(
            `>> [LEASE] [FAIL] Lease claim rejected: ${receipt.error}\n`,
        )
        return receipt
    } catch (err: any) {
        clearTimeout(timeoutHandle)
        const isTimeout = err.name === 'AbortError'
        const errorMsg = isTimeout
            ? `REQUEST_TIMEOUT: No response within ${timeoutMs}ms`
            : err.message

        const receipt: HardwareLeaseReceipt = {
            ok: false,
            status: 'REJECTED',
            leaseId: null,
            epoch: null,
            idempotencyKey,
            ttlMs,
            error: errorMsg,
        }

        process.stderr.write(
            `>> [LEASE] [FAIL] Lease acquisition exception: ${errorMsg}\n`,
        )
        return receipt
    }
}
