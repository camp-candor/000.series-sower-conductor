export interface SwangleRenderOptions {
    entryPoint: string
    compositionId: string
    outputFilePath: string
    concurrency?: number
    glBackend?: 'swangle'
    offthreadVideo?: boolean
    imageFormat?: 'png' | 'jpeg'
    pixelFormat?: 'yuv420p' | 'yuva420p'
    frameRange?: [number, number]
    timeoutMs?: number
    referencedAssets?: string[]
}

export interface PreflightAssetCheckResult {
    valid: boolean
    missingAssets: string[]
    emptyHashAssets: string[]
    inspectedCount: number
}

export interface SwangleRenderReceipt {
    ok: boolean
    outputFilePath: string
    renderedFrames: number
    durationMs: number
    exitCode: number
    vramUsedMb: 0
    telemetry: string[]
    error?: string
}
