import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import {
    SwangleRenderOptions,
    PreflightAssetCheckResult,
    SwangleRenderReceipt,
} from '../fce/renderOptions.interface.js'
import RemotionBit from '../fce/remotion.bit.js'
import { RemotionModel } from '../remotion.model.js'
import State from '../../99.core/state.js'

export const EMPTY_SHA256 =
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

export function executePreflightAssetCheck(
    assetPaths: string[] = [],
): PreflightAssetCheckResult {
    const missingAssets: string[] = []
    const emptyHashAssets: string[] = []

    for (const assetPath of assetPaths) {
        const resolvedPath = path.resolve(process.cwd(), assetPath)
        if (!fs.existsSync(resolvedPath)) {
            missingAssets.push(assetPath)
            continue
        }

        try {
            const stats = fs.statSync(resolvedPath)
            if (stats.size < 1024) {
                emptyHashAssets.push(assetPath)
                continue
            }

            const fileBuffer = fs.readFileSync(resolvedPath)
            const hash = crypto
                .createHash('sha256')
                .update(fileBuffer)
                .digest('hex')

            if (hash === EMPTY_SHA256) {
                emptyHashAssets.push(assetPath)
            }
        } catch {
            missingAssets.push(assetPath)
        }
    }

    return {
        valid: missingAssets.length === 0 && emptyHashAssets.length === 0,
        missingAssets,
        emptyHashAssets,
        inspectedCount: assetPaths.length,
    }
}

export function buildSwangleCliArgs(options: SwangleRenderOptions): string[] {
    const args = [
        'remotion',
        'render',
        options.entryPoint,
        options.compositionId,
        options.outputFilePath,
        `--gl=${options.glBackend || 'swangle'}`,
        `--concurrency=${options.concurrency !== undefined ? options.concurrency : 1}`,
        `--image-format=${options.imageFormat || 'png'}`,
        `--pixel-format=${options.pixelFormat || 'yuv420p'}`,
    ]

    if (options.offthreadVideo !== false) {
        args.push('--offthreadvideo')
    }

    if (options.frameRange && Array.isArray(options.frameRange)) {
        const [start, end] = options.frameRange
        args.push(`--frames=${start}-${end}`)
    }

    return args
}

export async function spawnSwangleRenderProcess(
    options: SwangleRenderOptions,
): Promise<SwangleRenderReceipt> {
    const startTime = Date.now()
    const telemetry: string[] = []

    const preflight = executePreflightAssetCheck(options.referencedAssets || [])
    if (!preflight.valid) {
        const errorMsg = `Preflight failed: ${preflight.missingAssets.length} missing, ${preflight.emptyHashAssets.length} empty/truncated assets.`
        telemetry.push(`>> [PREFLIGHT] [FAIL] ${errorMsg}`)
        return {
            ok: false,
            outputFilePath: options.outputFilePath,
            renderedFrames: 0,
            durationMs: Date.now() - startTime,
            exitCode: 1,
            vramUsedMb: 0,
            telemetry,
            error: errorMsg,
        }
    }

    telemetry.push(
        `>> [PREFLIGHT] [OK] Verified ${preflight.inspectedCount} media assets on disk.`,
    )
    telemetry.push(
        `>> [SWANGLE] Spawning CPU software OpenGL rasterizer (--gl=swangle, --concurrency=1, 0 MB VRAM)...`,
    )

    const args = buildSwangleCliArgs(options)
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'

    return new Promise((resolve) => {
        const child = spawn(npxCommand, args, {
            cwd: process.cwd(),
            env: {
                ...process.env,
                NODE_ENV: 'production',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        })

        let renderedFrames = 0
        const timeoutMs = options.timeoutMs || 180000
        let timer: NodeJS.Timeout | null = null

        if (timeoutMs > 0) {
            timer = setTimeout(() => {
                child.kill('SIGTERM')
                telemetry.push(
                    `>> [SWANGLE] [FAIL] Render timed out after ${timeoutMs}ms.`,
                )
            }, timeoutMs)
        }

        child.stdout.on('data', (chunk) => {
            const text = chunk.toString()
            const lines = text.split('\n')
            for (const line of lines) {
                if (!line.trim()) continue
                telemetry.push(`>> [RENDER-STDOUT] ${line.trim()}`)
                const frameMatch = line.match(/Rendered\s+(\d+)\s+frames/i)
                if (frameMatch) {
                    renderedFrames = parseInt(frameMatch[1], 10)
                }
            }
        })

        child.stderr.on('data', (chunk) => {
            const text = chunk.toString()
            const lines = text.split('\n')
            for (const line of lines) {
                if (!line.trim()) continue
                telemetry.push(`>> [RENDER-STDERR] ${line.trim()}`)
            }
        })

        child.on('close', (exitCode) => {
            if (timer) clearTimeout(timer)
            const durationMs = Date.now() - startTime
            const isSuccess = exitCode === 0

            telemetry.push(
                `>> [SWANGLE] ${isSuccess ? '[OK]' : '[FAIL]'} Subprocess exited with code ${exitCode} (${durationMs}ms).`,
            )

            resolve({
                ok: isSuccess,
                outputFilePath: options.outputFilePath,
                renderedFrames,
                durationMs,
                exitCode: exitCode ?? -1,
                vramUsedMb: 0,
                telemetry,
            })
        })

        child.on('error', (err) => {
            if (timer) clearTimeout(timer)
            const durationMs = Date.now() - startTime
            telemetry.push(
                `>> [SWANGLE] [FAIL] Subprocess spawn error: ${err.message}`,
            )
            resolve({
                ok: false,
                outputFilePath: options.outputFilePath,
                renderedFrames: 0,
                durationMs,
                exitCode: -1,
                vramUsedMb: 0,
                telemetry,
                error: err.message,
            })
        })
    })
}

export const renderSwangle = async (
    cpy: RemotionModel,
    bal: RemotionBit,
    _ste: State,
) => {
    const options = (bal.dat || {}) as SwangleRenderOptions
    const receipt = await spawnSwangleRenderProcess(options)

    cpy.lastRenderReceipt = receipt
    cpy.lastActionTimestamp = Date.now()

    if (bal.slv) {
        bal.slv({
            remotionBit: {
                idx: 'render-swangle',
                val: receipt.ok ? 1 : 0,
                src: receipt.outputFilePath,
                dat: receipt,
            },
        })
    }

    return cpy
}
