import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    buildSwangleCliArgs,
    executePreflightAssetCheck,
    spawnSwangleRenderProcess,
    EMPTY_SHA256,
} from '../35.remotion.unit/buz/renderSwangle.buzz.js'
import { SwangleRenderOptions } from '../35.remotion.unit/fce/renderOptions.interface.js'

describe('packages/400.conductor Feature 5.3 Headless Swangle Remotion Subprocess Renderer', () => {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')
    const testScratchDir = path.resolve(packageRoot, 'val/scratch_swangle_test')

    beforeEach(() => {
        if (!fs.existsSync(testScratchDir)) {
            fs.mkdirSync(testScratchDir, { recursive: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(testScratchDir)) {
            fs.rmSync(testScratchDir, { recursive: true, force: true })
        }
        vi.restoreAllMocks()
    })

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('builds CLI arguments enforcing --gl=swangle, --concurrency=1, and --offthreadvideo', () => {
        const options: SwangleRenderOptions = {
            entryPoint: 'src/episodes/Episode_040.tsx',
            compositionId: 'Episode_040',
            outputFilePath: 'outputs/ep040/master.mp4',
        }

        const args = buildSwangleCliArgs(options)
        expect(args).toContain('remotion')
        expect(args).toContain('render')
        expect(args).toContain('src/episodes/Episode_040.tsx')
        expect(args).toContain('Episode_040')
        expect(args).toContain('outputs/ep040/master.mp4')
        expect(args).toContain('--gl=swangle')
        expect(args).toContain('--concurrency=1')
        expect(args).toContain('--offthreadvideo')
        expect(args).toContain('--image-format=png')
        expect(args).toContain('--pixel-format=yuv420p')
    })

    it('appends frame range parameter when slice rendering is requested', () => {
        const options: SwangleRenderOptions = {
            entryPoint: 'src/index.ts',
            compositionId: 'ep040-sh03',
            outputFilePath: '/tmp/test_sh03.mp4',
            frameRange: [144, 180],
        }

        const args = buildSwangleCliArgs(options)
        expect(args).toContain('--frames=144-180')
    })

    it('catches missing media files during pre-flight asset inspection', () => {
        const check = executePreflightAssetCheck([
            'val/nonexistent_matte.png',
            'val/nonexistent_stem.wav',
        ])

        expect(check.valid).toBe(false)
        expect(check.missingAssets.length).toBe(2)
        expect(check.missingAssets).toContain('val/nonexistent_matte.png')
    })

    it('traps empty-hash sentinel SHA-256 (e3b0c442...) and truncated files < 1KB', () => {
        const emptyFilePath = path.join(testScratchDir, 'truncated_plate.mp4')
        fs.writeFileSync(emptyFilePath, Buffer.alloc(0)) // 0-byte file

        const tinyFilePath = path.join(testScratchDir, 'tiny_noise.mp4')
        fs.writeFileSync(tinyFilePath, Buffer.from('too short')) // < 1KB

        const check = executePreflightAssetCheck([emptyFilePath, tinyFilePath])
        expect(check.valid).toBe(false)
        expect(check.emptyHashAssets.length).toBe(2)
        expect(EMPTY_SHA256).toBe(
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        )
    })

    it('passes pre-flight audit when assets exist and exceed minimum byte threshold', () => {
        const validAssetPath = path.join(testScratchDir, 'valid_matte.png')
        const validData = Buffer.alloc(2048, 0xaa) // 2KB buffer
        fs.writeFileSync(validAssetPath, validData)

        const check = executePreflightAssetCheck([validAssetPath])
        expect(check.valid).toBe(true)
        expect(check.missingAssets.length).toBe(0)
        expect(check.emptyHashAssets.length).toBe(0)
    })

    it('fails early without spawning subprocess when pre-flight assets are invalid', async () => {
        const options: SwangleRenderOptions = {
            entryPoint: 'src/episodes/Episode_040.tsx',
            compositionId: 'Episode_040',
            outputFilePath: 'outputs/ep040/master.mp4',
            referencedAssets: ['missing_file_for_preflight.mp4'],
        }

        const receipt = await spawnSwangleRenderProcess(options)
        expect(receipt.ok).toBe(false)
        expect(receipt.exitCode).toBe(1)
        expect(receipt.vramUsedMb).toBe(0)
        expect(receipt.error).toContain('Preflight failed')
        expect(
            receipt.telemetry.some((t) => t.includes('[PREFLIGHT] [FAIL]')),
        ).toBe(true)
    })

    it('asserts 100% pure 7-bit ASCII compliance across 35.remotion.unit', () => {
        const dir = path.resolve(packageRoot, '35.remotion.unit')
        const scanDir = (target: string) => {
            const entries = fs.readdirSync(target, { withFileTypes: true })
            for (const entry of entries) {
                const full = path.join(target, entry.name)
                if (entry.isDirectory()) {
                    scanDir(full)
                } else if (entry.name.endsWith('.ts')) {
                    const content = fs.readFileSync(full, 'utf8')
                    // eslint-disable-next-line no-control-regex
                    const match = content.match(/[\u0080-\uFFFF]/)
                    expect(match).toBeNull()
                }
            }
        }
        scanDir(dir)
    })
})
