import { SwangleRenderOptions } from '../fce/renderOptions.interface.js'

export function buildSwangleCliArgs(options: SwangleRenderOptions): string[] {
    const args: string[] = [
        'remotion',
        'render',
        options.entryPoint,
        options.compositionId,
        options.outputLocation,
        // Triad Stability Controls (Google SwiftShader software rasterization, single worker, off-thread decode)
        '--gl=swangle',
        '--concurrency=1',
        '--offthreadvideo',
        // Locked encoding specification
        '--image-format=png',
        '--pixel-format=yuv420p',
    ]

    if (options.propsPath) {
        args.push(`--props=${options.propsPath}`)
    }

    if (options.logLevel) {
        args.push(`--log=${options.logLevel}`)
    }

    return args
}
