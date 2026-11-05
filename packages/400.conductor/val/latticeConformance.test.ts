import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { conformToDiffusionLattice } from '../37.lifecycle.unit/buz/latticeExpansion.buzz.js'
import { auditSawtoothFrameWaste } from '../37.lifecycle.unit/buz/wasteAuditor.buzz.js'

describe('packages/400.conductor Phase 5 Causal Diffusion Latent Lattice Conformance', () => {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('correctly expands raw delivery frames onto the 4n+1 causal diffusion lattice', () => {
        // 75 frames -> n = ceil((75-1)/4) = ceil(74/4) = 19 -> 4(19)+1 = 77 frames (slack: 2)
        const res75 = conformToDiffusionLattice(75)
        expect(res75.rawNativeFrames).toBe(75)
        expect(res75.conformedDiffusionFrames).toBe(77)
        expect(res75.paddingFrames).toBe(2)
        expect(res75.latticeIndexN).toBe(19)
        expect(res75.conformsTo4nPlus1).toBe(true)

        // Exact boundary matches: 17, 21, 25, 33, 49, 65, 77, 81 -> paddingFrames === 0
        const boundaries = [17, 21, 25, 33, 49, 65, 77, 81]
        for (const b of boundaries) {
            const res = conformToDiffusionLattice(b)
            expect(res.conformedDiffusionFrames).toBe(b)
            expect(res.paddingFrames).toBe(0)
            expect(res.conformsTo4nPlus1).toBe(true)
        }
    })

    it('supports Configuration A 12 fps on twos cadence mode', () => {
        // 75 delivery frames at 12 fps -> rawNativeFrames = ceil(75/2) = 38
        // n = ceil(37/4) = 10 -> 4(10)+1 = 41 frames (slack: 3)
        const res = conformToDiffusionLattice(75, {
            cadenceMode: 'CONFIG_A_12FPS',
            nativeFps: 12,
        })
        expect(res.rawNativeFrames).toBe(38)
        expect(res.conformedDiffusionFrames).toBe(41)
        expect(res.paddingFrames).toBe(3)
        expect(res.latticeIndexN).toBe(10)
    })

    it('audits sawtooth frame waste and identifies optimizable silence trims', () => {
        const stems = [
            { shotId: 'sh01', durationMs: 1542 }, // 38 frames -> 41 frames (waste: 3) -> optimizable!
            { shotId: 'sh02', durationMs: 1500 }, // 36 frames -> 37 frames (waste: 1)
            { shotId: 'sh03', durationMs: 3125 }, // 75 frames -> 77 frames (waste: 2)
        ]

        const report = auditSawtoothFrameWaste(stems)
        expect(report.totalTargetFrames).toBe(38 + 36 + 75)
        expect(report.totalDiffusionFrames).toBe(41 + 37 + 77)
        expect(report.totalSlackFrames).toBe(3 + 1 + 2)
        expect(report.optimizableShots.length).toBe(1)
        expect(report.optimizableShots[0].shotId).toBe('sh01')
        expect(report.optimizableShots[0].canOptimizeSilence).toBe(true)
    })

    it('asserts 100% pure 7-bit ASCII compliance across lattice unit files', () => {
        const files = [
            '37.lifecycle.unit/fce/lattice.interface.ts',
            '37.lifecycle.unit/buz/latticeExpansion.buzz.ts',
            '37.lifecycle.unit/buz/tailTrimmer.buzz.ts',
            '37.lifecycle.unit/buz/wasteAuditor.buzz.ts',
        ]

        for (const rel of files) {
            const full = path.resolve(packageRoot, rel)
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                // eslint-disable-next-line no-control-regex
                const match = content.match(/[\u0080-\uFFFF]/)
                expect(match).toBeNull()
            }
        }
    })
})
