import { describe, it, expect } from 'vitest'
import {
    calculateLatticeAllocation,
    conformFrameLattice,
} from '../24.frame.unit/buz/latticeConformance.buzz.js'
import { FrameModel } from '../24.frame.unit/frame.model.js'
import type FrameBit from '../24.frame.unit/fce/frame.bit.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('Feature 2.3 Causal 4n+1 Latent Lattice Conformance', () => {
    const model = new FrameModel()

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(
            process.cwd(),
            'packages/400.conductor/src',
        )
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('correctly expands raw delivery frames onto the round-up 4n+1 causal diffusion lattice', () => {
        // 75 frames -> n = ceil((75-1)/4) = ceil(74/4) = 19 -> 4(19)+1 = 77 frames (slack: 2)
        const alloc75 = calculateLatticeAllocation('sh_test_75', 75)
        expect(alloc75.raw_native_frames).toBe(75)
        expect(alloc75.conformed_diffusion_frames).toBe(77)
        expect(alloc75.tail_slack_frames).toBe(2)
        expect(alloc75.lattice_index_n).toBe(19)
        expect(alloc75.conforms_to_4n_plus_1).toBe(true)
        expect(alloc75.temporal_efficiency_pct).toBe(97.4)

        // Negative test: verify downward floor truncation (73 frames) is never applied
        expect(alloc75.conformed_diffusion_frames).not.toBe(73)
    })

    it('verifies clean boundary identity invariance with exactly zero tail slack', () => {
        // Discrete boundary targets: 17, 21, 25, 33, 49, 65, 77, 81 frames conform with 0 slack
        const boundaries = [17, 21, 25, 33, 49, 65, 77, 81]
        for (const b of boundaries) {
            const alloc = calculateLatticeAllocation(`sh_boundary_${b}`, b)
            expect(alloc.conformed_diffusion_frames).toBe(b)
            expect(alloc.tail_slack_frames).toBe(0)
            expect(alloc.conforms_to_4n_plus_1).toBe(true)
            expect(alloc.temporal_efficiency_pct).toBe(100)
        }
    })

    it('supports Configuration A 12 fps on twos cadence mode', () => {
        // 75 delivery frames at 12 fps -> rawNativeFrames = ceil(75 / 2) = 38
        // n = ceil((38 - 1) / 4) = ceil(37 / 4) = 10 -> 4(10)+1 = 41 frames (slack: 3)
        const allocA = calculateLatticeAllocation('sh_12fps', 75, {
            cadenceMode: 'CONFIG_A_12FPS',
            nativeFps: 12,
        })
        expect(allocA.raw_native_frames).toBe(38)
        expect(allocA.conformed_diffusion_frames).toBe(41)
        expect(allocA.tail_slack_frames).toBe(3)
        expect(allocA.lattice_index_n).toBe(10)
        expect(allocA.conforms_to_4n_plus_1).toBe(true)
    })

    it('conforms multi-shot worked example batch via buzzer hunt', async () => {
        let capturedResult: any = null

        const bal: FrameBit = {
            idx: 'test-batch-conformance',
            dat: {
                latticeRequest: [
                    { shot_id: 'shot_1', target_frames: 75 },
                    { shot_id: 'shot_2', target_frames: 45 },
                    { shot_id: 'shot_3', target_frames: 58 },
                ],
            },
            slv: (res: any) => {
                capturedResult = res.frmBit.dat?.latticeResult
            },
        }

        await conformFrameLattice(model, bal)

        expect(capturedResult).toBeDefined()
        expect(capturedResult.ok).toBe(true)
        expect(capturedResult.allocations.length).toBe(3)

        const [sh1, sh2, sh3] = capturedResult.allocations

        // Shot 1: 75f -> 77f (slack=2, n=19)
        expect(sh1.conformed_diffusion_frames).toBe(77)
        expect(sh1.tail_slack_frames).toBe(2)

        // Shot 2: 45f -> 45f (slack=0, n=11)
        expect(sh2.conformed_diffusion_frames).toBe(45)
        expect(sh2.tail_slack_frames).toBe(0)

        // Shot 3: 58f -> 61f (slack=3, n=15)
        expect(sh3.conformed_diffusion_frames).toBe(61)
        expect(sh3.tail_slack_frames).toBe(3)

        expect(capturedResult.total_delivery_frames).toBe(178)
        expect(capturedResult.total_diffusion_frames).toBe(183) // 77 + 45 + 61
        expect(capturedResult.total_tail_slack_frames).toBe(5)
    })

    it('asserts 100% pure 7-bit clean ASCII compliance across lattice unit files', () => {
        const files = [
            'packages/400.conductor/24.frame.unit/fce/frame.interface.ts',
            'packages/400.conductor/24.frame.unit/buz/latticeConformance.buzz.ts',
            'packages/400.conductor/val/latticeConformance.test.ts',
        ]

        for (const rel of files) {
            const full = path.resolve(process.cwd(), rel)
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                expect(/[\u0080-\uFFFF]/.test(content)).toBe(false)
            }
        }
    })
})
