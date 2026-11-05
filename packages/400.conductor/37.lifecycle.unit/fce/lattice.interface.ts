export type CadenceMode = 'CONFIG_A_12FPS' | 'CONFIG_B_24FPS' | 'CONFIG_C_16FPS'

export interface CadenceConfig {
    cadenceMode: CadenceMode
    nativeFps: number
}

export interface LatticeAllocationResult {
    targetDeliveryFrames: number
    nativeFps: number
    rawNativeFrames: number
    conformedDiffusionFrames: number
    paddingFrames: number
    latticeIndexN: number
    conformsTo4nPlus1: boolean
    cadenceMode: CadenceMode
}

export interface TailTrimOptions {
    ffmpegPath?: string
    copyAudio?: boolean
}

export interface TailTrimReceipt {
    ok: boolean
    inputVideoPath: string
    outputVideoPath: string
    originalFrames: number
    trimmedFrames: number
    discardedSlackFrames: number
    outputFps: 24
    t0Spend: '$0.00'
    error?: string
}

export interface ShotWasteAnalysis {
    shotId: string
    durationMs: number
    targetFrames: number
    diffusionFrames: number
    slackFramesWasted: number
    canOptimizeSilence: boolean
    silenceTrimMsNeeded: number
}

export interface SawtoothWasteReport {
    totalTargetFrames: number
    totalDiffusionFrames: number
    totalSlackFrames: number
    averageWastePercent: number
    optimizableShots: ShotWasteAnalysis[]
}
