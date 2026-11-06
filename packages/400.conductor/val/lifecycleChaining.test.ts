import { describe, it, expect, beforeEach } from 'vitest'
import { MasterSceneLifecycleContext } from '../37.lifecycle.unit/fce/masterLifecycle.interface.js'
import * as Chain from '../37.lifecycle.unit/buz/chainLifecycle.buzz.js'
import * as Meu from '../37.lifecycle.unit/buz/meuFallbackRouter.buzz.js'
import * as Cb from '../37.lifecycle.unit/buz/circuitBreaker.buzz.js'

describe('37.lifecycle.unit: Master Lifecycle Sequential Chaining', () => {
    let ctx: MasterSceneLifecycleContext

    beforeEach(() => {
        ctx = {
            sceneId: 'ep01_sc01',
            episodeId: 'ep01',
            currentStage: 'STAGE_0_IDLE',
            isDirty: false,
            shots: [
                {
                    shotId: 'sh01',
                    speakerId: 'char_bog',
                    dialogueText: 'The thread is stripped.',
                    durationMs: 3125,
                },
                {
                    shotId: 'sh02',
                    speakerId: 'char_elias',
                    dialogueText: 'Use the clamp.',
                    durationMs: 2000,
                },
            ],
            totalFrames: 0,
            activeLeaseId: null,
            activeEpoch: null,
            stampedTsxPath: null,
            outputDeliverablePath: null,
            lockfileSha256: null,
            vramUsedMb: 0,
            t0Spend: '$0.00',
            t4Spend: '$0.00',
            attemptCount: 0,
            maxAttempts: 3,
            telemetryLogs: [],
        }
    })

    it('chains all 8 milestones sequentially and locks into STAGE_8_PROVENANCE_SEALED at $T4 = $0.00', async () => {
        const res = await Chain.chainMasterSceneLifecycle(ctx)
        expect(res.currentStage).toBe('STAGE_8_PROVENANCE_SEALED')
        expect(res.totalFrames).toBe(123) // ceil(3125/1000*24) = 75, ceil(2000/1000*24) = 48 -> 123
        expect(res.vramUsedMb).toBe(0)
        expect(res.t0Spend).toBe('$0.00')
        expect(res.t4Spend).toBe('$0.00')
        expect(res.activeLeaseId).toBeDefined()
        expect(res.lockfileSha256).toBeDefined()
        expect(res.isDirty).toBe(false)
    })

    it('fails closed at Stage 1 ($T0 = $0.00) when scene is marked dirty', async () => {
        ctx.isDirty = true
        await expect(Chain.chainMasterSceneLifecycle(ctx)).rejects.toThrow(
            /HTTP 412 Precondition Failed/,
        )
        expect(ctx.currentStage).toBe('STAGE_1_INCEPTION_PREFLIGHT')
    })

    it('fails closed at Stage 2 when dialogue diverges from Fountain source', async () => {
        const fountainScript = 'BOG\nSome completely different dialogue.'
        await expect(
            Chain.chainMasterSceneLifecycle(ctx, undefined, {
                fountainSourceScript: fountainScript,
            }),
        ).rejects.toThrow(/PARITY_CHECK_FAILED/)
        expect(ctx.currentStage).toBe('STAGE_2_AST_VERBATIM_LOCK')
    })

    it('trips zombie epoch fence when presented epoch is stale', async () => {
        ctx.activeEpoch = 1
        await expect(
            Chain.chainMasterSceneLifecycle(ctx, undefined, {
                mockCoordinatorEpoch: 3,
            }),
        ).rejects.toThrow(/HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH/)
        expect(ctx.currentStage).toBe('STAGE_5_HARDWARE_MUTEX_ACQUIRED')
    })

    it('enforces asymmetric MEU 40% blast radius ceiling law', () => {
        // 10 beats total: modified at Beat 5 -> 6 beats affected (60%) -> ESCALATE
        const rExceed = Meu.routeMeuRepair('ep01_sc01', 5, 10)
        expect(rExceed.action).toBe('ESCALATE')
        expect(rExceed.repairSpanRatio).toBe(0.6)
        expect(rExceed.shouldHalt).toBe(true)

        // 10 beats total: modified at Beat 8 -> 3 beats affected (30%) -> INFILL
        const rUnder = Meu.routeMeuRepair('ep01_sc01', 8, 10)
        expect(rUnder.action).toBe('INFILL')
        expect(rUnder.repairSpanRatio).toBe(0.3)
        expect(rUnder.shouldHalt).toBe(false)
    })

    it('trips circuit breaker and quarantines to STAGE_FAILED_DLQ after 3 failures', () => {
        const error = new Error('Simulated optical compositing crash')

        // Strike 1
        const r1 = Cb.evaluateFailureEscalation(ctx, error)
        expect(r1.quarantined).toBe(false)
        expect(r1.action).toBe('RETRY')
        expect(ctx.attemptCount).toBe(1)

        // Strike 2
        const r2 = Cb.evaluateFailureEscalation(ctx, error)
        expect(r2.quarantined).toBe(false)
        expect(r2.action).toBe('RETRY')
        expect(ctx.attemptCount).toBe(2)

        // Strike 3
        const r3 = Cb.evaluateFailureEscalation(ctx, error)
        expect(r3.quarantined).toBe(true)
        expect(r3.action).toBe('DEAD_LETTER_QUARANTINE')
        expect(ctx.currentStage).toBe('STAGE_FAILED_DLQ')
    })
})
