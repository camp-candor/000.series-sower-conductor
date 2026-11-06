import { MeuRepairDecision } from '../fce/masterLifecycle.interface.js';

export function routeMeuRepair(
  sceneId: string,
  modifiedBeatIndex: number,
  totalBeats: number,
): MeuRepairDecision {
  if (totalBeats <= 0) {
    return {
      sceneId,
      action: 'ESCALATE',
      repairSpanRatio: 1.0,
      affectedBeats: 0,
      totalBeats: 0,
      reason: 'INVALID_TOTAL_BEATS',
      shouldHalt: true,
    };
  }

  const clampedIndex = Math.max(1, Math.min(modifiedBeatIndex, totalBeats));
  const affectedBeats = totalBeats - clampedIndex + 1;
  const repairSpanRatio = Math.round((affectedBeats / totalBeats) * 10000) / 10000;

  // Asymmetric 40% Ceiling Law
  if (repairSpanRatio > 0.40) {
    const reason = `BLAST_RADIUS_EXCEEDED: Invalidation span (${(repairSpanRatio * 100).toFixed(1)}%) exceeds 40% threshold (${affectedBeats}/${totalBeats} beats).`;
    process.stderr.write(`>> [MEU] [ESCALATE] ${reason}\n`);
    return {
      sceneId,
      action: 'ESCALATE',
      repairSpanRatio,
      affectedBeats,
      totalBeats,
      reason,
      shouldHalt: true,
    };
  }

  const reason = `INFILL_AUTHORIZED: Invalidation span (${(repairSpanRatio * 100).toFixed(1)}%) is within 40% threshold (${affectedBeats}/${totalBeats} beats).`;
  process.stdout.write(`>> [MEU] [OK] ${reason}\n`);
  return {
    sceneId,
    action: 'INFILL',
    repairSpanRatio,
    affectedBeats,
    totalBeats,
    reason,
    shouldHalt: false,
  };
}
