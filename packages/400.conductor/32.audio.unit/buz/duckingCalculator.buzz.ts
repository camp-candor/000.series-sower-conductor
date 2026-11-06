// packages/400.conductor/32.audio.unit/buz/duckingCalculator.buzz.ts
import { DialogueWindow, DuckingGainNode } from '../fce/audio.interface.js'

export const ATTACK_FRAMES = 6
export const RELEASE_FRAMES = 12
export const ATTENUATION_DB = -14.0

export const calculateDuckedVolume = (
    baseVolume: number,
    attenuationDb = ATTENUATION_DB,
): number => {
    const linearMultiplier = Math.pow(10, attenuationDb / 20) // 10^(-14/20) ~ 0.199526
    return Number((baseVolume * linearMultiplier).toFixed(4))
}

export const computeSingleWindowGain = (
    frame: number,
    startFrame: number,
    endFrame: number,
    baseGain: number,
    duckedGain: number,
): number => {
    if (frame < startFrame - ATTACK_FRAMES) return baseGain

    // Quadratic Attack Phase (Easing.outQuad): gain drops to duckedGain
    if (frame >= startFrame - ATTACK_FRAMES && frame < startFrame) {
        const t = (frame - (startFrame - ATTACK_FRAMES)) / ATTACK_FRAMES
        const progress = t * (2 - t) // QuadOut
        return Number(
            (baseGain - (baseGain - duckedGain) * progress).toFixed(4),
        )
    }

    // Active Dialogue Window: clamped flat at duckedGain
    if (frame >= startFrame && frame <= endFrame) {
        return duckedGain
    }

    // Quadratic Release Phase (Easing.inQuad): gain recovers to baseGain
    if (frame > endFrame && frame <= endFrame + RELEASE_FRAMES) {
        const t = (frame - endFrame) / RELEASE_FRAMES
        const progress = t * t // QuadIn
        return Number(
            (duckedGain + (baseGain - duckedGain) * progress).toFixed(4),
        )
    }

    return baseGain
}

export const computeMultiWindowDuckingCurve = (
    windows: DialogueWindow[],
    totalFrames: number,
    baseVolume = 0.4,
): DuckingGainNode[] => {
    if (totalFrames <= 0) return []
    const duckedVolume = calculateDuckedVolume(baseVolume)
    const keyframes: DuckingGainNode[] = []

    for (let f = 0; f < totalFrames; f++) {
        let minGain = baseVolume
        for (const win of windows) {
            const g = computeSingleWindowGain(
                f,
                win.from_frame,
                win.to_frame,
                baseVolume,
                duckedVolume,
            )
            if (g < minGain) {
                minGain = g
            }
        }
        // Record sample points or contour transitions
        keyframes.push({ frame: f, gain: Number(minGain.toFixed(4)) })
    }

    return keyframes
}
