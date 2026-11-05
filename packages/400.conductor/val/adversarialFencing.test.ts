import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { chainMasterSceneLifecycle } from '../37.lifecycle.unit/buz/chainLifecycle.buzz.js'
import { MasterSceneLifecycleContext } from '../37.lifecycle.unit/fce/masterLifecycle.interface.js'

describe('packages/400.conductor Phase 12: Stale Epoch Zombie Worker Fencing Gauntlet', () => {
    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(
            process.cwd(),
            'packages/400.conductor/src',
        )
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('rejects stale epoch operations with HTTP 409 Conflict ZOMBIE_LEASE_EPOCH', async () => {
        const ctx: MasterSceneLifecycleContext = {
            sceneId: 'ep01_sc01',
            episodeId: 'ep01',
            currentStage: 'STAGE_0_IDLE',
            isDirty: false,
            shots: [
                {
                    shotId: 'sh01',
                    speakerId: 'char_elias',
                    dialogueText: 'The pressure needle is shivering.',
                    durationMs: 3125,
                },
            ],
            totalFrames: 0,
            activeLeaseId: 'lease_ep01_sc01_stale',
            activeEpoch: 1, // Stale Epoch 1
            stampedTsxPath: null,
            outputDeliverablePath: null,
            lockfileSha256: null,
            vramUsedMb: 0,
            t4Spend: '$0.00',
            attemptCount: 0,
            maxAttempts: 3,
            telemetryLogs: [],
        }

        // Coordinator watchdog has advanced to Epoch 2
        await expect(
            chainMasterSceneLifecycle(ctx, undefined, {
                mockCoordinatorEpoch: 2,
            }),
        ).rejects.toThrowError(/HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH/)

        expect(ctx.currentStage).toBe('STAGE_5_HARDWARE_MUTEX_ACQUIRED')
        expect(ctx.isDirty).toBe(false)
    })

    it('allows active epoch matching coordinator to proceed cleanly', async () => {
        const ctx: MasterSceneLifecycleContext = {
            sceneId: 'ep01_sc02',
            episodeId: 'ep01',
            currentStage: 'STAGE_0_IDLE',
            isDirty: false,
            shots: [
                {
                    shotId: 'sh01',
                    speakerId: 'char_elias',
                    dialogueText: 'The pressure needle is shivering.',
                    durationMs: 3125,
                },
            ],
            totalFrames: 0,
            activeLeaseId: 'lease_ep01_sc02_active',
            activeEpoch: 5, // Valid Epoch 5
            stampedTsxPath: null,
            outputDeliverablePath: null,
            lockfileSha256: null,
            vramUsedMb: 0,
            t4Spend: '$0.00',
            attemptCount: 0,
            maxAttempts: 3,
            telemetryLogs: [],
        }

        const finalCtx = await chainMasterSceneLifecycle(ctx, undefined, {
            mockCoordinatorEpoch: 5,
        })
        expect(finalCtx.currentStage).toBe('STAGE_8_PROVENANCE_SEALED')
    })

    it('asserts 100% pure 7-bit ASCII compliance across adversarial fencing test', () => {
        const candidatePaths = [
            path.resolve(process.cwd(), 'val/adversarialFencing.test.ts'),
            path.resolve(
                process.cwd(),
                'packages/400.conductor/val/adversarialFencing.test.ts',
            ),
        ]
        const testPath =
            candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0]
        const content = fs.readFileSync(testPath, 'utf8')
        // eslint-disable-next-line no-control-regex
        const match = content.match(/[\u0080-\uFFFF]/)
        expect(match).toBeNull()
    })
})
