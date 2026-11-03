import { describe, it, expect } from 'vitest'
import sim from '../hunt.js'
import * as ActFrame from '../24.frame.unit/frame.action.js'
import {
    calculateCausalVaeAllocation,
    quantizeShotTimeline,
} from '../24.frame.unit/buz/frame.buzz.js'

describe('packages/400.conductor 24.frame.unit Temporal Lattice Quantization', () => {
    it('calculates 4n+1 causal VAE allocation and trim slack with zero negative error', () => {
        // 75 delivery frames -> n = ceil((75-1)/4) = 19 -> 4(19)+1 = 77
        const { allocation, trimEndFrames, efficiencyPct } =
            calculateCausalVaeAllocation(75)
        expect(allocation).toBe(77)
        expect((allocation - 1) % 4).toBe(0)
        expect(trimEndFrames).toBe(2)
        expect(efficiencyPct).toBeCloseTo(97.4, 1)

        // Exact lattice boundary: 37 frames -> n = ceil(36/4) = 9 -> 4(9)+1 = 37
        const exact = calculateCausalVaeAllocation(37)
        expect(exact.allocation).toBe(37)
        expect(exact.trimEndFrames).toBe(0)
        expect(exact.efficiencyPct).toBe(100.0)
    })

    it('tiles sequential shots using cumulative-millisecond math with zero drift across cuts', () => {
        // Epic 3 invariant: frame spans derive from quantized cumulative-ms
        // boundaries (3120 -> f75, 4960 -> f119, 7360 -> f177), never from
        // per-shot ceil, so total drift stays under 1 frame (41.67 ms).
        const rawShots = [
            { shotId: 'sh01', durationMs: 3120 }, // 3.12s -> 75 frames (from 0 to 74)
            { shotId: 'sh02', durationMs: 1840 }, // 1.84s -> 44 frames (from 75 to 118)
            { shotId: 'sh03', durationMs: 2400 }, // 2.40s -> 58 frames (from 119 to 176)
        ]

        const timeline = quantizeShotTimeline(rawShots)
        expect(timeline.length).toBe(3)

        // Shot 1 assertions
        expect(timeline[0].targetFrames).toBe(75)
        expect(timeline[0].fromFrame).toBe(0)
        expect(timeline[0].toFrame).toBe(74)

        // Shot 2 assertions (Perfect contiguity: fromFrame === prev.toFrame + 1)
        expect(timeline[1].fromFrame).toBe(75)
        expect(timeline[1].targetFrames).toBe(44)
        expect(timeline[1].toFrame).toBe(118)

        // Shot 3 assertions
        expect(timeline[2].fromFrame).toBe(119)
        expect(timeline[2].targetFrames).toBe(58)
        expect(timeline[2].toFrame).toBe(176)

        // Total episode drift must remain under 1 frame (41.67 ms)
        const totalMs = rawShots.reduce((acc, s) => acc + s.durationMs, 0)
        const totalFrames = timeline[timeline.length - 1].toFrame + 1
        expect(Math.abs((totalFrames / 24) * 1000 - totalMs)).toBeLessThan(
            41.67,
        )
    })

    it('clamps ultra-brief sub-frame durations to minimum 1-frame interval', () => {
        const briefShots = [
            { shotId: 'sh_gasp', durationMs: 12 }, // 12ms < 41.67ms
        ]

        const timeline = quantizeShotTimeline(briefShots)
        expect(timeline[0].targetFrames).toBe(1)
        expect(timeline[0].fromFrame).toBe(0)
        expect(timeline[0].toFrame).toBe(0)
        expect(timeline[0].diffusionAllocation).toBe(1)
        expect(timeline[0].trimEndFrames).toBe(0)
    })

    it('dispatches COMPILE_TIMELINE_BUDGET via sim.hunt cleanly', async () => {
        const res = await sim.hunt!(ActFrame.COMPILE_TIMELINE_BUDGET, {
            src: 'ep01_sc01',
            dat: {
                shots: [
                    { shotId: 'sh01', durationMs: 3120 },
                    { shotId: 'sh02', durationMs: 2000 },
                ],
            },
        })

        expect(res).toBeDefined()
        expect(res.frameBit.val).toBe(1)
        expect(res.frameBit.dat.totalDeliveryFrames).toBe(123) // 75 + 48
    })
})
