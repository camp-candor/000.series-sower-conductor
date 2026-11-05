import {
    ShotWasteAnalysis,
    SawtoothWasteReport,
} from '../fce/lattice.interface.js'
import { conformToDiffusionLattice } from './latticeExpansion.buzz.js'

export function auditSawtoothFrameWaste(
    stems: { shotId: string; durationMs: number }[] = [],
): SawtoothWasteReport {
    let totalTargetFrames = 0
    let totalDiffusionFrames = 0
    let totalSlackFrames = 0
    const analyses: ShotWasteAnalysis[] = []

    for (const stem of stems) {
        const targetFrames = Math.ceil((stem.durationMs / 1000) * 24.0)
        const lattice = conformToDiffusionLattice(targetFrames)

        totalTargetFrames += targetFrames
        totalDiffusionFrames += lattice.conformedDiffusionFrames
        totalSlackFrames += lattice.paddingFrames

        // Check if trimming <= 65ms of silence saves 4 frames
        // 65ms = ~1.56 frames -> 1 or 2 frames can cross a 4n+1 boundary
        const canOptimizeSilence = lattice.paddingFrames >= 3
        const silenceTrimMsNeeded = canOptimizeSilence
            ? Math.ceil((1 / 24.0) * 1000)
            : 0

        analyses.push({
            shotId: stem.shotId,
            durationMs: stem.durationMs,
            targetFrames,
            diffusionFrames: lattice.conformedDiffusionFrames,
            slackFramesWasted: lattice.paddingFrames,
            canOptimizeSilence,
            silenceTrimMsNeeded,
        })
    }

    const averageWastePercent =
        totalDiffusionFrames > 0
            ? Math.round((totalSlackFrames / totalDiffusionFrames) * 10000) /
              100
            : 0

    return {
        totalTargetFrames,
        totalDiffusionFrames,
        totalSlackFrames,
        averageWastePercent,
        optimizableShots: analyses.filter((a) => a.canOptimizeSilence),
    }
}
