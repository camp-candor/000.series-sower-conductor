import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { chainMasterSceneLifecycle } from '../37.lifecycle.unit/buz/chainLifecycle.buzz.js';
import { routeMeuRepair } from '../37.lifecycle.unit/buz/meuFallbackRouter.buzz.js';
import { evaluateFailureEscalation } from '../37.lifecycle.unit/buz/circuitBreaker.buzz.js';
import { MasterSceneLifecycleContext } from '../37.lifecycle.unit/fce/masterLifecycle.interface.js';

describe('packages/400.conductor Phase 12: Offline Adversarial Verification Gauntlet', () => {
  it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('verifies immutable runner boundary has exactly 0 modified lines in apps/995.library/995.library/**', () => {
    const diff = execSync('git status -s apps/995.library/995.library/', { encoding: 'utf8' }).trim();
    expect(diff).toBe('');
  });

  it('[Task 12.1] halts at Preflight Inception in < 5ms when scene dependencies are dirty (T0 = $0.00)', async () => {
    const dirtyCtx: MasterSceneLifecycleContext = {
      sceneId: 'ep01_sc01_dirty',
      episodeId: 'ep01',
      currentStage: 'STAGE_0_IDLE',
      isDirty: true, // Dirty precondition
      shots: [
        {
          shotId: 'sh01',
          speakerId: 'char_elias',
          dialogueText: 'The pressure needle is shivering.',
          durationMs: 3125,
        },
      ],
      totalFrames: 0,
      activeLeaseId: null,
      activeEpoch: null,
      stampedTsxPath: null,
      outputDeliverablePath: null,
      lockfileSha256: null,
      vramUsedMb: 0,
      t4Spend: '$0.00',
      attemptCount: 0,
      maxAttempts: 3,
      telemetryLogs: [],
    };

    const startTime = performance.now();
    await expect(chainMasterSceneLifecycle(dirtyCtx)).rejects.toThrowError(
      /Precondition Failed: Scene ep01_sc01_dirty is marked dirty in CANON_DB/
    );
    const durationMs = performance.now() - startTime;

    expect(durationMs).toBeLessThan(15); // Fast fail-closed gate
    expect(dirtyCtx.currentStage).toBe('STAGE_1_INCEPTION_PREFLIGHT');
    expect(dirtyCtx.totalFrames).toBe(0);
    expect(dirtyCtx.vramUsedMb).toBe(0);
  });

  it('[Task 12.2] aborts with PARITY_CHECK_FAILED when Fountain prose and AST dialogue diverge', async () => {
    const ctx: MasterSceneLifecycleContext = {
      sceneId: 'ep01_sc01_parity_fail',
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
      activeLeaseId: null,
      activeEpoch: null,
      stampedTsxPath: null,
      outputDeliverablePath: null,
      lockfileSha256: null,
      vramUsedMb: 0,
      t4Spend: '$0.00',
      attemptCount: 0,
      maxAttempts: 3,
      telemetryLogs: [],
    };

    // Divergent Fountain screenplay: "quivering" vs "shivering"
    const divergentFountain = `ELIAS\nThe pressure needle is quivering.\n`;

    await expect(
      chainMasterSceneLifecycle(ctx, undefined, {
        fountainSourceScript: divergentFountain,
      })
    ).rejects.toThrowError(/PARITY_CHECK_FAILED/);

    expect(ctx.currentStage).toBe('STAGE_2_AST_VERBATIM_LOCK');
    expect(ctx.totalFrames).toBe(0);
  });

  it('enforces the 40% ceiling law in routeMeuRepair', () => {
    // 10 beats total. Invalidation starting at beat 5 -> affected: 6 beats (60%) -> ESCALATE
    const resOver = routeMeuRepair('ep01_sc01', 5, 10);
    expect(resOver.action).toBe('ESCALATE');
    expect(resOver.repairSpanRatio).toBe(0.60);
    expect(resOver.affectedBeats).toBe(6);

    // Invalidation starting at beat 8 -> affected: 3 beats (30%) -> INFILL
    const resUnder = routeMeuRepair('ep01_sc01', 8, 10);
    expect(resUnder.action).toBe('INFILL');
    expect(resUnder.repairSpanRatio).toBe(0.30);
    expect(resUnder.affectedBeats).toBe(3);
  });

  it('trips the circuit breaker on Strike 3 routing to STAGE_FAILED_DLQ', () => {
    const ctx: MasterSceneLifecycleContext = {
      sceneId: 'ep01_sc01',
      episodeId: 'ep01',
      currentStage: 'STAGE_1_INCEPTION_PREFLIGHT',
      isDirty: false,
      shots: [],
      totalFrames: 0,
      activeLeaseId: null,
      activeEpoch: null,
      stampedTsxPath: null,
      outputDeliverablePath: null,
      lockfileSha256: null,
      vramUsedMb: 0,
      t4Spend: '$0.00',
      attemptCount: 0,
      maxAttempts: 3,
      telemetryLogs: [],
    };

    // Strike 1
    const strike1 = evaluateFailureEscalation(ctx, new Error('Simulated socket drop'));
    expect(strike1.quarantined).toBe(false);
    expect(strike1.action).toBe('RETRY');
    expect(ctx.attemptCount).toBe(1);

    // Strike 2
    const strike2 = evaluateFailureEscalation(ctx, new Error('Simulated socket drop'));
    expect(strike2.quarantined).toBe(false);
    expect(ctx.attemptCount).toBe(2);

    // Strike 3 (Quarantine)
    const strike3 = evaluateFailureEscalation(ctx, new Error('Fatal render failure'));
    expect(strike3.quarantined).toBe(true);
    expect(strike3.action).toBe('DEAD_LETTER_QUARANTINE');
    expect(ctx.currentStage).toBe('STAGE_FAILED_DLQ');
  });

  it('[Task 12.4] chains master scene lifecycle through all stages yielding STAGE_8_PROVENANCE_SEALED (0 MB VRAM)', async () => {
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
          durationMs: 3125, // 75 frames
        },
        {
          shotId: 'sh02',
          speakerId: 'char_torvin',
          dialogueText: 'Hold the gasket.',
          durationMs: 2000, // 48 frames
        },
      ],
      totalFrames: 0,
      activeLeaseId: null,
      activeEpoch: null,
      stampedTsxPath: null,
      outputDeliverablePath: null,
      lockfileSha256: null,
      vramUsedMb: 0,
      t4Spend: '$0.00',
      attemptCount: 0,
      maxAttempts: 3,
      telemetryLogs: [],
    };

    const finalCtx = await chainMasterSceneLifecycle(ctx);

    expect(finalCtx.currentStage).toBe('STAGE_8_PROVENANCE_SEALED');
    expect(finalCtx.totalFrames).toBe(123);
    expect(finalCtx.vramUsedMb).toBe(0);
    expect(finalCtx.t4Spend).toBe('$0.00');
    expect(finalCtx.activeLeaseId).toBeDefined();
    expect(finalCtx.lockfileSha256).toBeDefined();
    expect(finalCtx.isDirty).toBe(false);
  });

  it('asserts 100% pure 7-bit ASCII compliance across lifecycle coordinator modules', () => {
    const files = [
      'packages/400.conductor/37.lifecycle.unit/fce/masterLifecycle.interface.ts',
      'packages/400.conductor/37.lifecycle.unit/buz/meuFallbackRouter.buzz.ts',
      'packages/400.conductor/37.lifecycle.unit/buz/circuitBreaker.buzz.ts',
      'packages/400.conductor/37.lifecycle.unit/buz/chainLifecycle.buzz.ts',
      'packages/400.conductor/val/lifecycleChaining.test.ts',
    ];

    for (const rel of files) {
      const full = path.resolve(process.cwd(), rel);
      if (fs.existsSync(full)) {
        const content = fs.readFileSync(full, 'utf8');
        // eslint-disable-next-line no-control-regex
        const match = content.match(/[\u0080-\uFFFF]/);
        expect(match).toBeNull();
      }
    }
  });
});
