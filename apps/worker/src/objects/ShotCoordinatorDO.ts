import { ExecutionJob, FairQueue } from '../queue/fairQueue.js'
import {
    ClientRole,
    SocketAttachment,
    TelemetryEnvelope,
    MAX_RING_BUFFER_SIZE,
    WATCHDOG_TIMEOUT_MS,
    MAX_JOB_ATTEMPTS,
} from '../telemetry/sensoryRelay.js'

export interface HardwareLease {
    leaseId: string
    jobId: string
    sceneId: string
    artistId: string
    epoch: number
    grantedAtMs: number
    ttlMs: number
    expiresAtMs: number
    attemptCount: number
}

export interface LeaseRecord {
    leaseId: string
    sceneId: string
    epoch: number
    grantedAtMs: number
    ttlMs: number
}

export class ShotCoordinatorDO {
    public ctx: any
    public env: any
    private currentEpoch: number = 0
    private activeLease: HardwareLease | null = null
    private lastArtistId: string | null = null
    private queue: FairQueue = new FairQueue()
    private idempotencyCache: Map<
        string,
        { response: any; timestampMs: number }
    > = new Map()
    private telemetrySeq: number = 0
    private ringBuffer: TelemetryEnvelope[] = []
    private state: any

    constructor(ctx: DurableObjectState, env?: any) {
        this.ctx = ctx
        this.state = ctx
        this.env = env
        if (env === undefined) {
            this.currentEpoch = 1
        }
        if (this.ctx && typeof this.ctx.blockConcurrencyWhile === 'function') {
            this.ctx.blockConcurrencyWhile(async () => {
                const storedEpoch = (await this.ctx.storage.get(
                    'current_epoch',
                )) as number | undefined
                this.currentEpoch = storedEpoch ?? 0

                const storedLease = (await this.ctx.storage.get(
                    'active_lease',
                )) as HardwareLease | undefined
                this.activeLease = storedLease ?? null

                const storedArtist = (await this.ctx.storage.get(
                    'last_artist_id',
                )) as string | undefined
                this.lastArtistId = storedArtist ?? null

                const storedQueue = (await this.ctx.storage.get(
                    'queue_items',
                )) as ExecutionJob[] | undefined
                if (storedQueue) {
                    this.queue.fromJSON(storedQueue)
                }

                const storedSeq = (await this.ctx.storage.get(
                    'telemetry_seq',
                )) as number | undefined
                this.telemetrySeq = storedSeq ?? 0

                const storedRing = (await this.ctx.storage.get(
                    'ring_buffer',
                )) as TelemetryEnvelope[] | undefined
                if (storedRing) {
                    this.ringBuffer = storedRing
                }
            })
        }
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)
        const path = url.pathname
        const method = request.method

        if (path === '/lease/acquire' && method === 'POST') {
            const body = (await request.json().catch(() => ({}))) as {
                sceneId?: string
                ttlMs?: number
                presentedEpoch?: number
            }
            const now = Date.now()

            if (
                body.presentedEpoch !== undefined &&
                body.presentedEpoch < this.currentEpoch
            ) {
                return new Response(
                    JSON.stringify({
                        error: 'HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH',
                        currentEpoch: this.currentEpoch,
                    }),
                    {
                        status: 409,
                        headers: { 'Content-Type': 'application/json' },
                    },
                )
            }

            this.currentEpoch++
            const sceneId = body.sceneId || 'ep01_sc01'
            const lease: LeaseRecord = {
                leaseId: `lease_${sceneId}_${now}`,
                sceneId,
                epoch: this.currentEpoch,
                grantedAtMs: now,
                ttlMs: body.ttlMs || 30000,
            }

            this.activeLease = lease as any
            const storage = this.ctx?.storage || this.state?.storage
            if (storage) {
                await storage.put('activeLease', lease)
                await storage.put('currentEpoch', this.currentEpoch)
            }

            return new Response(JSON.stringify(lease), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        if (path === '/lease/current' && method === 'GET') {
            return new Response(
                JSON.stringify({
                    lease: this.activeLease,
                    epoch: this.currentEpoch,
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        // WebSocket Upgrade Handshake
        if (path === '/ws' || path === '/ws/telemetry') {
            return this.handleWebSocketUpgrade(request)
        }

        // Internal Route Broadcast Relay
        if (method === 'POST' && path === '/internal/broadcast') {
            const body: any = await request.json().catch(() => ({}))
            this.broadcastTelemetry(
                body.type || 'BROADCAST',
                body.payload || {},
                body.role || 'all',
            )
            return new Response(
                JSON.stringify({ ok: true, seq: this.telemetrySeq }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        if (method === 'GET' && path === '/status') {
            return this.handleGetStatus()
        }

        if (method === 'POST') {
            if (path === '/lease/request' || path === '/lease/acquire') {
                return this.handleLeaseRequest(request)
            }
            if (path === '/lease/heartbeat') {
                return this.handleLeaseHeartbeat(request)
            }
            if (path === '/lease/complete') {
                return this.handleLeaseComplete(request)
            }
            if (path === '/lease/abort') {
                return this.handleLeaseAbort(request)
            }
        }

        return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    private handleWebSocketUpgrade(request: Request): Response {
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response(
                'HTTP 426 Upgrade Required: WebSocket protocol required',
                {
                    status: 426,
                    headers: { 'Content-Type': 'text/plain' },
                },
            )
        }

        const url = new URL(request.url)
        const roleParam = url.searchParams.get('role')
        const role: ClientRole =
            roleParam === 'broker' || roleParam === 'operator'
                ? roleParam
                : 'artist'
        const clientId =
            url.searchParams.get('clientId') || `client_${Date.now()}`

        // Cloudflare native WebSocketPair instantiation
        const pair = new (globalThis as any).WebSocketPair()
        const client = pair[0]
        const server = pair[1]

        // Accept via WebSocket Hibernation API with role tagging
        this.ctx.acceptWebSocket(server, [role])

        const attachment: SocketAttachment = {
            clientId,
            role,
            connectedAtMs: Date.now(),
        }
        server.serializeAttachment(attachment)

        // Replay historical telemetry envelopes to connecting client
        if (this.ringBuffer.length > 0) {
            const replayPayload = {
                type: 'TELEMETRY_HISTORY',
                seq: this.telemetrySeq,
                payload: {
                    items: this.ringBuffer,
                },
            }
            server.send(JSON.stringify(replayPayload))
        }

        this.broadcastTelemetry(
            'CLIENT_CONNECTED',
            { clientId, role, activeClients: this.ctx.getWebSockets().length },
            'operator',
        )

        return new Response(null, {
            status: 101,
            webSocket: client,
        })
    }

    async webSocketMessage(
        ws: WebSocket,
        message: string | ArrayBuffer,
    ): Promise<void> {
        const raw =
            typeof message === 'string'
                ? message
                : new TextDecoder().decode(message)
        if (raw === 'PING') {
            ws.send('PONG')
            return
        }

        try {
            const parsed = JSON.parse(raw)
            if (parsed.type === 'PING') {
                ws.send(
                    JSON.stringify({ type: 'PONG', timestampMs: Date.now() }),
                )
            }
        } catch {
            // Ignored: Non-JSON raw heartbeat frame
        }
    }

    async webSocketClose(
        ws: WebSocket,
        _code: number,
        _reason: string,
        _wasClean: boolean,
    ): Promise<void> {
        const attachment = ws.deserializeAttachment() as SocketAttachment | null
        if (attachment) {
            this.broadcastTelemetry(
                'CLIENT_DISCONNECTED',
                { clientId: attachment.clientId, role: attachment.role },
                'operator',
            )
        }
    }

    async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
        const attachment = ws.deserializeAttachment() as SocketAttachment | null
        process.stderr.write(
            `>> [WS] [ERROR] Socket error for ${attachment?.clientId || 'unknown'}: ${error}\n`,
        )
    }

    public broadcastTelemetry(
        eventType: string,
        payload: any,
        targetRole: ClientRole | 'all' = 'artist',
    ): void {
        this.telemetrySeq += 1
        const envelope: TelemetryEnvelope = {
            seq: this.telemetrySeq,
            type: eventType,
            source: 'ShotCoordinatorDO',
            timestampMs: Date.now(),
            payload,
            ascii: `>> [TELEMETRY] [${eventType}] seq:${this.telemetrySeq}`,
        }

        // Maintain bounded ring buffer
        this.ringBuffer.push(envelope)
        if (this.ringBuffer.length > MAX_RING_BUFFER_SIZE) {
            this.ringBuffer.shift()
        }

        const json = JSON.stringify(envelope)

        // Multicast to targeted role group via Hibernation API
        const sockets =
            targetRole === 'all'
                ? this.ctx.getWebSockets()
                : this.ctx.getWebSockets(targetRole)

        for (const socket of sockets) {
            try {
                socket.send(json)
            } catch (err: any) {
                process.stderr.write(
                    `>> [WS] [WARN] Broadcast send failed: ${err.message}\n`,
                )
            }
        }
    }

    private handleGetStatus(): Response {
        return new Response(
            JSON.stringify({
                ok: true,
                currentEpoch: this.currentEpoch,
                hasActiveLease: this.activeLease !== null,
                activeLease: this.activeLease,
                queueLength: this.queue.size(),
                lastArtistId: this.lastArtistId,
                telemetrySeq: this.telemetrySeq,
                connectedSockets: this.ctx.getWebSockets().length,
            }),
            { headers: { 'Content-Type': 'application/json' } },
        )
    }

    private async handleLeaseRequest(request: Request): Promise<Response> {
        const body: any = await request.json().catch(() => ({}))
        const jobId = body.jobId || `job_${Date.now()}`
        const sceneId = body.sceneId || 'sc01'
        const artistId = body.artistId || 'artist_default'
        const idempotencyKey = body.idempotencyKey || `idem_${jobId}`
        const ttlMs = Number(body.ttlMs) || WATCHDOG_TIMEOUT_MS

        // Idempotency check
        if (this.idempotencyCache.has(idempotencyKey)) {
            const cached = this.idempotencyCache.get(idempotencyKey)!
            return new Response(JSON.stringify(cached.response), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Cache': 'IDEMPOTENT_HIT',
                },
            })
        }

        // Hardware Mutex Check
        if (this.activeLease !== null) {
            const job: ExecutionJob = {
                jobId,
                sceneId,
                artistId,
                idempotencyKey,
                ttlMs,
                enqueuedAtMs: Date.now(),
                attemptCount: 1,
                maxAttempts: MAX_JOB_ATTEMPTS,
            }

            const enqueued = this.queue.enqueue(job)
            if (enqueued) {
                await this.ctx.storage.put('queue_items', this.queue.toJSON())
            }

            const responsePayload = {
                ok: true,
                status: 'QUEUED',
                queuePosition: this.queue.size(),
                jobId,
                currentEpoch: this.currentEpoch,
            }

            this.idempotencyCache.set(idempotencyKey, {
                response: responsePayload,
                timestampMs: Date.now(),
            })

            this.broadcastTelemetry(
                'TASK_QUEUED',
                { jobId, artistId, queuePosition: this.queue.size() },
                'all',
            )

            return new Response(JSON.stringify(responsePayload), {
                status: 202,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // Grant Active Lease: Monotonic Epoch Increment N -> N+1
        this.currentEpoch += 1
        const now = Date.now()
        const lease: HardwareLease = {
            leaseId: `lease_${jobId}_${now}`,
            jobId,
            sceneId,
            artistId,
            epoch: this.currentEpoch,
            grantedAtMs: now,
            ttlMs,
            expiresAtMs: now + ttlMs,
            attemptCount: 1,
        }

        this.activeLease = lease
        this.lastArtistId = artistId

        await this.ctx.storage.put('active_lease', lease)
        await this.ctx.storage.put('current_epoch', this.currentEpoch)
        await this.ctx.storage.put('last_artist_id', this.lastArtistId)

        // Arm Watchdog Storage Alarm
        await this.ctx.storage.setAlarm(lease.expiresAtMs)

        const responsePayload = {
            ok: true,
            status: 'LEASE_GRANTED',
            lease,
            currentEpoch: this.currentEpoch,
        }

        this.idempotencyCache.set(idempotencyKey, {
            response: responsePayload,
            timestampMs: now,
        })

        this.broadcastTelemetry(
            'LEASE_GRANTED',
            { leaseId: lease.leaseId, jobId, epoch: this.currentEpoch },
            'all',
        )

        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    private async handleLeaseHeartbeat(request: Request): Promise<Response> {
        const body: any = await request.json().catch(() => ({}))
        const leaseId = body.leaseId
        const incomingEpoch = Number(body.epoch)

        // Monotonic Epoch Fencing Assertion
        if (
            !this.activeLease ||
            this.activeLease.leaseId !== leaseId ||
            incomingEpoch !== this.currentEpoch
        ) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: {
                        code: 'ZOMBIE_LEASE_EPOCH',
                        message: `Heartbeat rejected: incoming epoch ${incomingEpoch} does not match active epoch ${this.currentEpoch}`,
                        currentEpoch: this.currentEpoch,
                    },
                }),
                {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        // Extend Lease
        const now = Date.now()
        this.activeLease.expiresAtMs = now + this.activeLease.ttlMs

        await this.ctx.storage.put('active_lease', this.activeLease)
        await this.ctx.storage.setAlarm(this.activeLease.expiresAtMs)

        this.broadcastTelemetry(
            'HEARTBEAT_ACK',
            { leaseId, epoch: this.currentEpoch },
            'operator',
        )

        return new Response(
            JSON.stringify({
                ok: true,
                status: 'HEARTBEAT_ACK',
                leaseId,
                epoch: this.currentEpoch,
                expiresAtMs: this.activeLease.expiresAtMs,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
    }

    private async handleLeaseComplete(request: Request): Promise<Response> {
        const body: any = await request.json().catch(() => ({}))
        const leaseId = body.leaseId
        const incomingEpoch = Number(body.epoch)

        // Monotonic Epoch Fencing Assertion
        if (
            !this.activeLease ||
            this.activeLease.leaseId !== leaseId ||
            incomingEpoch !== this.currentEpoch
        ) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: {
                        code: 'ZOMBIE_LEASE_EPOCH',
                        message: `Completion rejected: incoming epoch ${incomingEpoch} is stale; active epoch is ${this.currentEpoch}`,
                        currentEpoch: this.currentEpoch,
                    },
                }),
                {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        const completedJobId = this.activeLease.jobId

        // Universal Disarm on leaving active lease
        await this.ctx.storage.deleteAlarm()
        await this.ctx.storage.delete('active_lease')
        this.activeLease = null

        this.broadcastTelemetry(
            'LEASE_COMPLETED',
            { leaseId, jobId: completedJobId, epoch: incomingEpoch },
            'all',
        )

        // Dispatch next fair job if available
        const nextJob = this.queue.dequeueNextFair(this.lastArtistId)
        let nextLease: HardwareLease | null = null

        if (nextJob) {
            this.currentEpoch += 1
            const now = Date.now()
            nextLease = {
                leaseId: `lease_${nextJob.jobId}_${now}`,
                jobId: nextJob.jobId,
                sceneId: nextJob.sceneId,
                artistId: nextJob.artistId,
                epoch: this.currentEpoch,
                grantedAtMs: now,
                ttlMs: nextJob.ttlMs,
                expiresAtMs: now + nextJob.ttlMs,
                attemptCount: nextJob.attemptCount,
            }

            this.activeLease = nextLease
            this.lastArtistId = nextJob.artistId

            await this.ctx.storage.put('active_lease', nextLease)
            await this.ctx.storage.put('current_epoch', this.currentEpoch)
            await this.ctx.storage.put('last_artist_id', this.lastArtistId)
            await this.ctx.storage.put('queue_items', this.queue.toJSON())
            await this.ctx.storage.setAlarm(nextLease.expiresAtMs)

            this.broadcastTelemetry(
                'LEASE_GRANTED',
                {
                    leaseId: nextLease.leaseId,
                    jobId: nextLease.jobId,
                    epoch: this.currentEpoch,
                },
                'all',
            )
        } else {
            await this.ctx.storage.put('queue_items', [])
        }

        return new Response(
            JSON.stringify({
                ok: true,
                status: 'LEASE_COMPLETED',
                completedLeaseId: leaseId,
                nextJobDispatched: nextLease !== null,
                nextLease,
                currentEpoch: this.currentEpoch,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
    }

    private async handleLeaseAbort(request: Request): Promise<Response> {
        const body: any = await request.json().catch(() => ({}))
        const leaseId = body.leaseId

        if (this.activeLease && this.activeLease.leaseId === leaseId) {
            const abortedJobId = this.activeLease.jobId
            await this.ctx.storage.deleteAlarm()
            await this.ctx.storage.delete('active_lease')
            this.activeLease = null
            this.currentEpoch += 1
            await this.ctx.storage.put('current_epoch', this.currentEpoch)

            this.broadcastTelemetry(
                'LEASE_ABORTED',
                { leaseId, jobId: abortedJobId, newEpoch: this.currentEpoch },
                'all',
            )

            // Dequeue next fair task
            const nextJob = this.queue.dequeueNextFair(this.lastArtistId)
            if (nextJob) {
                this.currentEpoch += 1
                const now = Date.now()
                const nextLease: HardwareLease = {
                    leaseId: `lease_${nextJob.jobId}_${now}`,
                    jobId: nextJob.jobId,
                    sceneId: nextJob.sceneId,
                    artistId: nextJob.artistId,
                    epoch: this.currentEpoch,
                    grantedAtMs: now,
                    ttlMs: nextJob.ttlMs,
                    expiresAtMs: now + nextJob.ttlMs,
                    attemptCount: nextJob.attemptCount,
                }
                this.activeLease = nextLease
                this.lastArtistId = nextJob.artistId

                await this.ctx.storage.put('active_lease', nextLease)
                await this.ctx.storage.put('current_epoch', this.currentEpoch)
                await this.ctx.storage.put('last_artist_id', this.lastArtistId)
                await this.ctx.storage.put('queue_items', this.queue.toJSON())
                await this.ctx.storage.setAlarm(nextLease.expiresAtMs)

                this.broadcastTelemetry(
                    'LEASE_GRANTED',
                    {
                        leaseId: nextLease.leaseId,
                        jobId: nextLease.jobId,
                        epoch: this.currentEpoch,
                    },
                    'all',
                )
            }
        }

        return new Response(
            JSON.stringify({
                ok: true,
                status: 'LEASE_ABORTED',
                currentEpoch: this.currentEpoch,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
    }

    async alarm(): Promise<void> {
        if (!this.activeLease) {
            return
        }

        const expiredLease = this.activeLease
        this.activeLease = null
        await this.ctx.storage.delete('active_lease')

        // Monotonically advance epoch to fence out timed-out zombie runner
        this.currentEpoch += 1
        await this.ctx.storage.put('current_epoch', this.currentEpoch)

        // Three-Strike Escalation Check
        const newAttemptCount = expiredLease.attemptCount + 1

        if (newAttemptCount > MAX_JOB_ATTEMPTS) {
            // Trip Circuit Breaker into Dead-Letter Queue (DLQ)
            const dlqRecord = {
                jobId: expiredLease.jobId,
                sceneId: expiredLease.sceneId,
                artistId: expiredLease.artistId,
                failedAtMs: Date.now(),
                attemptCount: newAttemptCount - 1,
                reason: 'MAX_ATTEMPTS_EXCEEDED_WATCHDOG_TIMEOUT',
            }
            await this.ctx.storage.put(`dlq:${expiredLease.jobId}`, dlqRecord)

            this.broadcastTelemetry(
                'TASK_QUARANTINED_DLQ',
                {
                    jobId: expiredLease.jobId,
                    reason: dlqRecord.reason,
                    attempts: dlqRecord.attemptCount,
                },
                'all',
            )
        } else {
            // Re-queue with incremented attempt count
            const requeuedJob: ExecutionJob = {
                jobId: expiredLease.jobId,
                sceneId: expiredLease.sceneId,
                artistId: expiredLease.artistId,
                idempotencyKey: `retry_${expiredLease.jobId}_${newAttemptCount}`,
                ttlMs: expiredLease.ttlMs,
                enqueuedAtMs: Date.now(),
                attemptCount: newAttemptCount,
                maxAttempts: MAX_JOB_ATTEMPTS,
            }
            this.queue.requeuePriority(requeuedJob)
            await this.ctx.storage.put('queue_items', this.queue.toJSON())

            this.broadcastTelemetry(
                'LEASE_TIMED_OUT_RETRY',
                {
                    jobId: expiredLease.jobId,
                    attempt: newAttemptCount,
                    newEpoch: this.currentEpoch,
                },
                'all',
            )
        }

        // Promote next fair task
        const nextJob = this.queue.dequeueNextFair(this.lastArtistId)
        if (nextJob) {
            this.currentEpoch += 1
            const now = Date.now()
            const nextLease: HardwareLease = {
                leaseId: `lease_${nextJob.jobId}_${now}`,
                jobId: nextJob.jobId,
                sceneId: nextJob.sceneId,
                artistId: nextJob.artistId,
                epoch: this.currentEpoch,
                grantedAtMs: now,
                ttlMs: nextJob.ttlMs,
                expiresAtMs: now + nextJob.ttlMs,
                attemptCount: nextJob.attemptCount,
            }
            this.activeLease = nextLease
            this.lastArtistId = nextJob.artistId

            await this.ctx.storage.put('active_lease', nextLease)
            await this.ctx.storage.put('current_epoch', this.currentEpoch)
            await this.ctx.storage.put('last_artist_id', this.lastArtistId)
            await this.ctx.storage.put('queue_items', this.queue.toJSON())
            await this.ctx.storage.setAlarm(nextLease.expiresAtMs)

            this.broadcastTelemetry(
                'LEASE_GRANTED',
                {
                    leaseId: nextLease.leaseId,
                    jobId: nextLease.jobId,
                    epoch: this.currentEpoch,
                },
                'all',
            )
        }
    }
}
