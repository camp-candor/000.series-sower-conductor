import { describe, it, expect } from 'vitest'
import {
    calculateCeilingFrames,
    tileTimelineFrames,
    SINGLE_FRAME_MS,
} from '../24.frame.unit/buz/tileTimeline.buzz.js'
import { FrameModel } from '../24.frame.unit/frame.model.js'
import type FrameBit from '../24.frame.unit/fce/frame.bit.js'
import {
    TILE_TIMELINE_LABEL,
    runTimelineTilingMenu,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

describe('Feature 2.2: Discrete 24 fps Timeline Tiling', () => {
    const model = new FrameModel()

    it('calculates integer ceiling frame budgets and guarantees video never underruns audio', () => {
        // 3,120 ms -> 3.120 * 24 = 74.88 -> ceil = 75 frames (3,125 ms)
        expect(calculateCeilingFrames(3120)).toBe(75)

        // 1,840 ms -> 1.840 * 24 = 44.16 -> ceil = 45 frames (1,875 ms)
        expect(calculateCeilingFrames(1840)).toBe(45)

        // 2,400 ms -> 2.400 * 24 = 57.60 -> ceil = 58 frames (2,416.67 ms)
        expect(calculateCeilingFrames(2400)).toBe(58)

        // Exact integer boundary: 1,000 ms -> 1.000 * 24 = 24.0 -> ceil = 24 frames
        expect(calculateCeilingFrames(1000)).toBe(24)
    })

    it('clamps sub-frame durations (< 41.67 ms) to a minimum of 1 frame allocation', () => {
        // 30 ms interjection < 41.67 ms single-frame threshold -> clamped to 1 frame
        expect(calculateCeilingFrames(30)).toBe(1)
        expect(calculateCeilingFrames(5)).toBe(1)
        expect(calculateCeilingFrames(SINGLE_FRAME_MS - 1)).toBe(1)
    })

    it('verifies contiguous zero-drift timeline tiling for canonical 3-shot worked example', async () => {
        let capturedResult: any = null

        const bal: FrameBit = {
            idx: 'test-canonical-tiling',
            dat: {
                tilingRequest: [
                    { shot_id: 'shot_1', duration_ms: 3120 },
                    { shot_id: 'shot_2', duration_ms: 1840 },
                    { shot_id: 'shot_3', duration_ms: 2400 },
                ],
            },
            slv: (res: any) => {
                capturedResult = res.frmBit.dat?.tilingResult
            },
        }

        await tileTimelineFrames(model, bal)

        expect(capturedResult).toBeDefined()
        expect(capturedResult.ok).toBe(true)
        expect(capturedResult.contiguous).toBe(true)
        expect(capturedResult.shots.length).toBe(3)

        const [sh1, sh2, sh3] = capturedResult.shots

        // Shot 1: 0 to 74 (75 frames)
        expect(sh1.from_frame).toBe(0)
        expect(sh1.to_frame).toBe(74)
        expect(sh1.frame_count).toBe(75)

        // Shot 2: 75 to 119 (45 frames)
        // Cumulative ms at start: 3120 ms -> ceil(3.120 * 24) = 75
        // Cumulative ms at end: 3120 + 1840 = 4960 ms -> ceil(4.960 * 24) - 1 = ceil(119.04) - 1 = 120 - 1 = 119
        expect(sh2.from_frame).toBe(75)
        expect(sh2.to_frame).toBe(119)
        expect(sh2.frame_count).toBe(45)
        expect(sh1.to_frame + 1).toBe(sh2.from_frame) // Contiguity: End_k + 1 == Start_{k+1}

        // Shot 3 starts contiguously at frame 120
        expect(sh3.from_frame).toBe(120)
        expect(sh2.to_frame + 1).toBe(sh3.from_frame) // Contiguity preserved

        // Bounded drift assertion: total drift relative to elapsed audio < 41.67 ms (1 frame)
        expect(Math.abs(capturedResult.drift_ms)).toBeLessThan(SINGLE_FRAME_MS)
    })

    it('guarantees contiguity across long sequence with sub-frame interjections', async () => {
        let capturedResult: any = null

        const bal: FrameBit = {
            idx: 'test-subframe-sequence',
            dat: {
                tilingRequest: [
                    { shot_id: 'shot_grunt', duration_ms: 25 }, // Clamped to 41.67ms
                    { shot_id: 'shot_dialogue', duration_ms: 1250 },
                    { shot_id: 'shot_sigh', duration_ms: 15 }, // Clamped to 41.67ms
                ],
            },
            slv: (res: any) => {
                capturedResult = res.frmBit.dat?.tilingResult
            },
        }

        await tileTimelineFrames(model, bal)

        expect(capturedResult.ok).toBe(true)
        expect(capturedResult.contiguous).toBe(true)

        const shots = capturedResult.shots
        for (let i = 0; i < shots.length - 1; i++) {
            expect(shots[i].to_frame + 1).toBe(shots[i + 1].from_frame)
            expect(shots[i].frame_count).toBeGreaterThanOrEqual(1)
        }
    })

    it('verifies 100% 7-bit clean ASCII compliance in tiling source files', () => {
        const packageRoot = path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            '..',
        )
        const tileFile = path.resolve(
            packageRoot,
            '24.frame.unit/buz/tileTimeline.buzz.ts',
        )
        const content = fs.readFileSync(tileFile, 'utf8')
        expect(/[\u0080-\uFFFF]/.test(content)).toBe(false)
    })

    it('fails closed on empty tilingRequest inputs', async () => {
        let capturedResult: any = null
        await tileTimelineFrames(model, {
            idx: 'test-empty-tiling',
            dat: { tilingRequest: [] },
            slv: (res: any) => {
                capturedResult = res.frmBit.dat?.tilingResult
            },
        })
        expect(capturedResult?.ok).toBe(false)
        expect(capturedResult?.error).toContain('TILING_ERROR')
    })

    it('streams [3] TILE DISCRETE 24 FPS TIMELINE telemetry to cns00 via runTimelineTilingMenu', async () => {
        expect(TILE_TIMELINE_LABEL).toBe('[3] TILE DISCRETE 24 FPS TIMELINE')
        const lines: string[] = []
        let resolved: any = null

        const mockState = {
            hunt: async (action: string, bale: any) => {
                if (action === '[Console action] Update Console' && bale?.src) {
                    lines.push(bale.src)
                    return {}
                }
                if (action === '[Frame action] Tile Timeline Frames') {
                    let tiled: any = null
                    await tileTimelineFrames(
                        new FrameModel(),
                        {
                            ...bale,
                            slv: (r: any) => {
                                tiled = r
                            },
                        },
                        mockState as any,
                    )
                    return tiled
                }
                return {}
            },
        } as any

        await runTimelineTilingMenu(
            new MenuModel(),
            {
                idx: 'test-menu-tiling',
                slv: (res: any) => {
                    resolved = res
                },
            },
            mockState,
        )

        expect(resolved?.mnuBit?.idx).toBe('run-timeline-tiling-menu')
        expect(resolved?.mnuBit?.val).toBe(0)
        expect(lines.some((l) => l.includes('[TILING:INIT]'))).toBe(true)
        expect(
            lines.some((l) => l.includes('Total: 177 frames (7360.0ms audio)')),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[TILING:PROOFS] Shot 1: F00-F74 (75f) | Shot 2: F75-F119 (45f) | Shot 3: F120-F176 (57f)',
                ),
            ),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[TILING:CONTIGUOUS] End_k + 1 == Start_{k+1} verified across cuts',
                ),
            ),
        ).toBe(true)
    })
})
