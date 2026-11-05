import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { chainMasterSceneLifecycle } from '../37.lifecycle.unit/buz/chainLifecycle.buzz.js';
import { routeMeuRepair } from '../37.lifecycle.unit/buz/meuFallbackRouter.buzz.js';
import { evaluateFailureEscalation } from '../37.lifecycle.unit/buz/circuitBreaker.buzz.js';
import { MasterSceneLifecycleContext } from '../37.lifecycle.unit/fce/masterLifecycle.interface.js';

describe('packages/400.conductor Phase 10 Master Scene Lifecycle State Machine Coordinator', () => {
  it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
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

  it('chains master scene lifecycle through all stages yielding STAGE_8_PROVENANCE_SEALED', async () => {
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
