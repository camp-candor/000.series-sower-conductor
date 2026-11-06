import { dispatchEdgeHttpRequest } from './restClient.buzz.js'

export interface HeartbeatSession {
    leaseId: string
    epoch: number
    intervalMs: number
    stop: () => void
    isRunning: () => boolean
}

export function spawnLeaseHeartbeat(params: {
    leaseId: string
    epoch: number
    intervalMs?: number
    onHeartbeatAck?: (ackMs: number) => void
    onHeartbeatFailure?: (err: any) => void
}): HeartbeatSession {
    const intervalMs = params.intervalMs ?? 10000
    let running = true
    let timerHandle: NodeJS.Timeout | null = null

    const tick = async () => {
        if (!running) return

        try {
            const res = await dispatchEdgeHttpRequest({
                method: 'POST',
                endpointPath: '/lease/heartbeat',
                body: {
                    leaseId: params.leaseId,
                    epoch: params.epoch,
                    timestampMs: Date.now(),
                },
                timeoutMs: 3000,
            })

            if (res.ok) {
                process.stdout.write(
                    `>> [HEARTBEAT] [OK] Lease ${params.leaseId} heartened at epoch ${params.epoch}.\n`,
                )
                if (params.onHeartbeatAck) params.onHeartbeatAck(Date.now())
            } else {
                process.stderr.write(
                    `>> [HEARTBEAT] [WARN] Heartbeat unacknowledged: ${res.error?.code}\n`,
                )
                if (params.onHeartbeatFailure)
                    params.onHeartbeatFailure(res.error)
            }
        } catch (err) {
            process.stderr.write(
                `>> [HEARTBEAT] [FAIL] Heartbeat exception: ${err}\n`,
            )
            if (params.onHeartbeatFailure) params.onHeartbeatFailure(err)
        }

        if (running) {
            timerHandle = setTimeout(tick, intervalMs)
        }
    }

    timerHandle = setTimeout(tick, intervalMs)

    return {
        leaseId: params.leaseId,
        epoch: params.epoch,
        intervalMs,
        stop: () => {
            running = false
            if (timerHandle) clearTimeout(timerHandle)
            process.stdout.write(
                `>> [HEARTBEAT] [OK] Stopped heartbeat session for ${params.leaseId}.\n`,
            )
        },
        isRunning: () => running,
    }
}
