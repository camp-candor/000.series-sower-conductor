import { QuantizedFrameBudget } from '../../24.frame.unit/fce/frame.interface.js';

export interface ShotBakingInput {
  shotId: string;
  characterId: string;
  dialogueText: string;
  platePath: string;
  backgroundPath: string;
  durationMs: number;
  deliveryFrames: number;
  fromFrame: number;
  diffusionAllocation: number;
  trimEndFrames: number;
  transformOriginX: number;
  transformOriginY: number;
  initialScale: number;
  targetScale: number;
}

export function formatUnquotedLiteral(val: number): string {
  if (!Number.isFinite(val)) return '0';
  return Number.isInteger(val) ? val.toString(10) : Number(val.toFixed(4)).toString(10);
}

export function computeCumulativeShotTimings(
  shots: Array<{ shotId: string; characterId: string; dialogueText: string; platePath: string; backgroundPath: string; durationMs: number }>
): ShotBakingInput[] {
  let cumulativeMs = 0;
  let currentFromFrame = 0;
  const result: ShotBakingInput[] = [];

  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    const durationMs = Math.max(s.durationMs, 42); // Clamp to minimum 1 frame
    cumulativeMs += durationMs;

    const deliveryFrames = Math.max(1, Math.ceil((durationMs / 1000) * 24));
    const n = Math.ceil((deliveryFrames - 1) / 4);
    const diffusionAllocation = 4 * n + 1;
    const trimEndFrames = diffusionAllocation - deliveryFrames;

    result.push({
      shotId: s.shotId,
      characterId: s.characterId,
      dialogueText: s.dialogueText,
      platePath: s.platePath,
      backgroundPath: s.backgroundPath,
      durationMs,
      deliveryFrames,
      fromFrame: currentFromFrame,
      diffusionAllocation,
      trimEndFrames,
      transformOriginX: 50.0,
      transformOriginY: 85.0,
      initialScale: 1.0,
      targetScale: 1.05,
    });

    currentFromFrame += deliveryFrames;
  }

  return result;
}
