import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { buildSwangleCliArgs } from '../35.remotion.unit/buz/swangleCliBuilder.buzz.js'
import { spawnSwangleRenderProcess } from '../35.remotion.unit/buz/renderSwangle.buzz.js'
import { verifyMasterDeliverable } from '../35.remotion.unit/buz/verifyDeliverable.buzz.js'
import { SwangleRenderOptions } from '../35.remotion.unit/fce/renderOptions.interface.js'

describe('packages/400.conductor Phase 8 Headless Swangle Optical Assembly Compositing', () => {
    const mockOptions: SwangleRenderOptions = {
        entryPoint: 'drafts/Master_ep01_sc01.tsx',
        compositionId: 'ep01_sc01',
        outputLocation: 'outputs/ep01_sc01.mp4',
        timeoutMs: 5000,
        expectedFrames: 75,
    }

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(
            process.cwd(),
            'packages/400.conductor/src',
        )
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('builds CLI arguments enforcing Triad Stability Controls (--gl=swangle, --concurrency=1, --offthreadvideo)', () => {
        const args = buildSwangleCliArgs(mockOptions)

        expect(args).toContain('remotion')
        expect(args).toContain('render')
        expect(args).toContain('drafts/Master_ep01_sc01.tsx')
        expect(args).toContain('ep01_sc01')
        expect(args).toContain('outputs/ep01_sc01.mp4')

        // Triad Stability Controls
        expect(args).toContain('--gl=swangle')
        expect(args).toContain('--concurrency=1')
        expect(args).toContain('--offthreadvideo')

        // Encoding standards
        expect(args).toContain('--image-format=png')
        expect(args).toContain('--pixel-format=yuv420p')
    })

    it('spawns child process, parses frame progress telemetry, and returns vramUsedMb = 0', async () => {
        // Mock child process
        const mockSpawn = () => {
            const child = new EventEmitter() as any
            child.stdout = new EventEmitter()
            child.stderr = new EventEmitter()
            child.kill = () => {}

            setTimeout(() => {
                child.stdout.emit(
                    'data',
                    Buffer.from('Rendered 24 frames (32%)\n'),
                )
                child.stdout.emit(
                    'data',
                    Buffer.from('Rendered 75 frames (100%)\n'),
                )
                child.emit('close', 0)
            }, 20)

            return child
        }

        const receipt = await spawnSwangleRenderProcess(
            mockOptions,
            mockSpawn as any,
        )

        expect(receipt.ok).toBe(true)
        expect(receipt.renderedFrames).toBe(75)
        expect(receipt.vramUsedMb).toBe(0)
        expect(receipt.t4Spend).toBe('$0.00')
        expect(receipt.cliCommand).toContain('--gl=swangle')
        expect(receipt.cliCommand).toContain('--concurrency=1')
        expect(receipt.cliCommand).toContain('--offthreadvideo')
    })

    it('handles execution timeouts cleanly and returns structured failure receipt', async () => {
        let killedWithSignal = ''
        const mockHangingSpawn = () => {
            const child = new EventEmitter() as any
            child.stdout = new EventEmitter()
            child.stderr = new EventEmitter()
            child.kill = (sig: string) => {
                killedWithSignal = sig
                child.emit('close', 1)
            }
            return child
        }

        const receipt = await spawnSwangleRenderProcess(
            { ...mockOptions, timeoutMs: 50 },
            mockHangingSpawn as any,
        )

        expect(receipt.ok).toBe(false)
        expect(receipt.error).toBe('EXECUTION_TIMEOUT')
        expect(killedWithSignal).toBe('SIGKILL')
    })

    it('verifies master deliverable file constraints on disk', async () => {
        const tmpDir = path.resolve(process.cwd(), 'val/scratch_swangle_test')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

        const validMockFile = path.join(tmpDir, 'valid_deliverable.mp4')
        fs.writeFileSync(validMockFile, Buffer.alloc(15000, 0)) // > 10,240 bytes

        const inspection = await verifyMasterDeliverable(validMockFile, 75)
        expect(inspection.valid).toBe(true)
        expect(inspection.vramUsedMb).toBe(0)
        expect(inspection.fileSizeBytes).toBeGreaterThan(10240)

        // Trap undersized files
        const tinyFile = path.join(tmpDir, 'tiny.mp4')
        fs.writeFileSync(tinyFile, Buffer.alloc(500, 0)) // < 10,240 bytes
        const tinyInspection = await verifyMasterDeliverable(tinyFile, 75)
        expect(tinyInspection.valid).toBe(false)
        expect(tinyInspection.error).toContain('FILE_UNDERSIZED')

        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('asserts 100% pure 7-bit ASCII compliance across swangle renderer modules', () => {
        const files = [
            'packages/400.conductor/35.remotion.unit/fce/renderOptions.interface.ts',
            'packages/400.conductor/35.remotion.unit/buz/swangleCliBuilder.buzz.ts',
            'packages/400.conductor/35.remotion.unit/buz/renderSwangle.buzz.ts',
            'packages/400.conductor/35.remotion.unit/buz/verifyDeliverable.buzz.ts',
        ]

        for (const rel of files) {
            const full = path.resolve(process.cwd(), rel)
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                // eslint-disable-next-line no-control-regex
                const match = content.match(/[\u0080-\uFFFF]/)
                expect(match).toBeNull()
            }
        }
    })
})
