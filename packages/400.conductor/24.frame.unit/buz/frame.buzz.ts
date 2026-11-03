import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { FrameModel } from '../frame.model.js';
import FrameBit from '../fce/frame.bit.js';
import State from '../../99.core/state.js';
import {
  ShotAcousticProbe,
  QuantizedFrameBudget,
  ExposureSheetManifest,
} from '../fce/frame.interface.js';

export function probeAcousticDurationMs(stemPath: string, customProbeFn?: (path: string) => number): number {
  if (customProbeFn) {
    return customProbeFn(stemPath);
  }

  if (!fs.existsSync(stemPath)) {
    throw new Error(`PROBE_FAILED: Audio stem not found on disk at ${stemPath}`);
  }

  try {
    const rawSeconds = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${stemPath}"`,
      { stdio: ['ignore', 'pipe', 'ignore'] }
    )
      .toString('ascii')
      .trim();

    const parsedSeconds = parseFloat(rawSeconds);
    if (isNaN(parsedSeconds) || parsedSeconds <= 0) {
      throw new Error(`PROBE_INVALID_DURATION: ffprobe returned '${rawSeconds}'`);
    }

    return Math.round(parsedSeconds * 1000);
  } catch (err: any) {
    throw new Error(`PROBE_EXECUTION_FAULT: ${err.message}`);
  }
}

export function calculateCausalVaeAllocation(masterFrames: number): { allocation: number; trimEndFrames: number; efficiencyPct: number } {
  // Causal 3D VAE stride rule: 4n + 1
  const n = Math.ceil((masterFrames - 1) / 4);
  const allocation = 4 * n + 1;
  const trimEndFrames = allocation - masterFrames;
  const efficiencyPct = Number(((masterFrames / allocation) * 100).toFixed(2));

  return { allocation, trimEndFrames, efficiencyPct };
}

export function quantizeShotTimeline(
  shots: Array<{ shotId: string; stemPath?: string; durationMs?: number }>,
  customProbeFn?: (path: string) => number
): QuantizedFrameBudget[] {
  const result: QuantizedFrameBudget[] = [];
  let cumulativeMs = 0;
  let currentFromFrame = 0;

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const durationMs = shot.durationMs ?? probeAcousticDurationMs(shot.stemPath!, customProbeFn);

    // Sub-frame Zero-Length Interval Clamp: minimum 1 frame (41.67 ms)
    const clampedDurationMs = Math.max(durationMs, 42);
    cumulativeMs += clampedDurationMs;

    // Zero-drift cumulative timeline derivation
    const rawDeliveryFrames = Math.ceil((clampedDurationMs / 1000) * 24);
    const targetFrames = clampedDurationMs === 42 ? 1 : Math.max(1, rawDeliveryFrames);
    const toFrame = currentFromFrame + targetFrames - 1;

    const { allocation, trimEndFrames, efficiencyPct } = calculateCausalVaeAllocation(targetFrames);

    result.push({
      shotId: shot.shotId,
      durationMs: clampedDurationMs,
      deliveryFps: 24,
      targetFrames,
      fromFrame: currentFromFrame,
      toFrame,
      diffusionAllocation: allocation,
      trimEndFrames,
      latticeEfficiencyPct: efficiencyPct,
    });

    currentFromFrame = toFrame + 1;
  }

  return result;
}

export const initFrame = (cpy: FrameModel, bal: FrameBit, _ste: State) => {
  if (bal.slv) bal.slv({ frameBit: { idx: 'init-frame', val: 1 } });
  return cpy;
};

export const quantizeStemDuration = (cpy: FrameModel, bal: FrameBit, _ste: State) => {
  const cns = '>> [QUANTIZE]';
  const stemPath = bal.src || bal.dat?.stemPath;
  const shotId = bal.dat?.shotId || 'shot_000';
  const customProbeFn = bal.dat?.probeDurationFn;

  if (!stemPath && !bal.dat?.durationMs) {
    const err = 'QUANTIZATION_REJECTED: Missing stemPath or durationMs';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ frameBit: { idx: 'quantize-stem-duration-error', val: 0, src: err } });
    throw new Error(err);
  }

  try {
    const durationMs = bal.dat?.durationMs ?? probeAcousticDurationMs(stemPath!, customProbeFn);
    const budgets = quantizeShotTimeline([{ shotId, durationMs }]);
    const budget = budgets[0];

    process.stdout.write(
      `${cns} [OK] Shot ${shotId}: ${durationMs}ms -> ${budget.targetFrames} frames (VAE: ${budget.diffusionAllocation}f, Trim: ${budget.trimEndFrames}f)\n`
    );

    if (bal.slv) {
      bal.slv({
        frameBit: {
          idx: 'quantize-stem-duration',
          val: 1,
          src: shotId,
          dat: budget,
        },
      });
    }
  } catch (err: any) {
    process.stderr.write(`${cns} [FAIL] ${err.message}\n`);
    if (bal.slv) {
      bal.slv({ frameBit: { idx: 'quantize-stem-duration-error', val: 0, src: err.message } });
    } else {
      throw err;
    }
  }

  return cpy;
};

export const compileTimelineBudget = (cpy: FrameModel, bal: FrameBit, _ste: State) => {
  const cns = '>> [QUANTIZE]';
  const sceneId = bal.src || bal.dat?.sceneId || 'scene_000';
  const shots = (bal.dat?.shots || []) as Array<{ shotId: string; stemPath?: string; durationMs?: number }>;
  const customProbeFn = bal.dat?.probeDurationFn;

  if (shots.length === 0) {
    const err = `BUDGET_REJECTED: Zero shots provided for scene ${sceneId}`;
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ frameBit: { idx: 'compile-timeline-budget-error', val: 0, src: err } });
    throw new Error(err);
  }

  try {
    const quantizedShots = quantizeShotTimeline(shots, customProbeFn);
    const totalDurationMs = quantizedShots.reduce((acc, s) => acc + s.durationMs, 0);
    const totalDeliveryFrames = quantizedShots.reduce((acc, s) => acc + s.targetFrames, 0);

    const manifest: ExposureSheetManifest = {
      sceneId,
      compiledAtMs: Date.now(),
      deliveryFps: 24,
      totalDurationMs,
      totalDeliveryFrames,
      shots: quantizedShots,
    };

    cpy.totalScenesQuantized += 1;
    cpy.lastExposureSheet = manifest;

    process.stdout.write(
      `${cns} [OK] Scene ${sceneId} compiled: ${totalDurationMs}ms across ${quantizedShots.length} shots (${totalDeliveryFrames} frames)\n`
    );

    if (bal.slv) {
      bal.slv({
        frameBit: {
          idx: 'compile-timeline-budget',
          val: 1,
          src: sceneId,
          dat: manifest,
        },
      });
    }
  } catch (err: any) {
    process.stderr.write(`${cns} [FAIL] Compilation failed: ${err.message}\n`);
    if (bal.slv) {
      bal.slv({ frameBit: { idx: 'compile-timeline-budget-error', val: 0, src: err.message } });
    } else {
      throw err;
    }
  }

  return cpy;
};

