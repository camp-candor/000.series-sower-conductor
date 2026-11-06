export interface SwangleRenderOptions {
    entryPoint: string
    compositionId: string
    outputLocation: string
    timeoutMs?: number
    propsPath?: string
    logLevel?: 'verbose' | 'info' | 'warn' | 'error'
    expectedFrames?: number
}

export interface SwangleRenderReceipt {
    ok: boolean
    outputLocation: string
    totalFrames: number
    renderedFrames: number
    durationMs: number
    vramUsedMb: 0
    t4Spend: '$0.00'
    cliCommand: string
    exitCode: number
    error?: string
}

export interface DeliverableInspectionResult {
    valid: boolean
    filePath: string
    width: number
    height: number
    fps: number
    pixelFormat: string
    fileSizeBytes: number
    totalFrames: number
    vramUsedMb: 0
    t4Spend: '$0.00'
    error?: string
}
