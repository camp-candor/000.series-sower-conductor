import { describe, it, expect } from 'vitest'
import {
    calculateDuckedVolume,
    computeSingleWindowGain,
    computeMultiWindowDuckingCurve,
    computeDuckingCurve,
    murmurHash3,
    resolveDeterministicFoleyCue,
} from '../32.audio.unit/buz/acousticDucking.buzz.js'
import { AudioModel } from '../32.audio.unit/audio.model.js'
import {
    COMPUTE_DUCKING_LABEL,
    runAcousticDuckingMenu,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

describe('Feature 3.2: Multi-Window Minimum-Reduction Sidechain Ducking', () => {
    it('correctly converts decibel attenuation into linear gain floor', () => {
        expect(calculateDuckedVolume(0.4, -14.0)).toBe(0.0798)
        expect(calculateDuckedVolume(1.0, -14.0)).toBe(0.1995)
        expect(calculateDuckedVolume(0.4, -24.0)).toBe(0.0252)
    })

    it('evaluates exact quadratic attack trajectory t*(2 - t) across 6 frames', () => {
        const base = 0.4
        const ducked = 0.0798
        const start = 20
        const end = 40

        expect(computeSingleWindowGain(13, start, end, base, ducked)).toBe(0.4)
        expect(computeSingleWindowGain(14, start, end, base, ducked)).toBe(0.4)
        expect(computeSingleWindowGain(17, start, end, base, ducked)).toBe(
            0.1599,
        )
        expect(computeSingleWindowGain(20, start, end, base, ducked)).toBe(
            0.0798,
        )
        expect(computeSingleWindowGain(30, start, end, base, ducked)).toBe(
            0.0798,
        )
    })

    it('evaluates exact quadratic release trajectory t^2 across 12 frames', () => {
        const base = 0.4
        const ducked = 0.0798
        const start = 20
        const end = 40

        expect(computeSingleWindowGain(40, start, end, base, ducked)).toBe(
            0.0798,
        )
        expect(computeSingleWindowGain(46, start, end, base, ducked)).toBe(
            0.1599,
        )
        expect(computeSingleWindowGain(52, start, end, base, ducked)).toBe(0.4)
        expect(computeSingleWindowGain(53, start, end, base, ducked)).toBe(0.4)
    })

    it('eliminates volume pumping across rapid 7-frame dialogue pause (< 18 frames) via min-reducer', () => {
        const curve = computeMultiWindowDuckingCurve(
            [
                { shot_id: 'w1', from_frame: 10, to_frame: 30 },
                { shot_id: 'w2', from_frame: 38, to_frame: 60 },
            ],
            100,
            0.4,
            -14.0,
        )

        expect(curve[0].gain).toBe(0.4)
        expect(curve[10].gain).toBe(0.0798)
        expect(curve[25].gain).toBe(0.0798)
        expect(curve[30].gain).toBe(0.0798)
        expect(curve[34].gain).toBeLessThanOrEqual(0.16)
        expect(curve[38].gain).toBe(0.0798)
        expect(curve[50].gain).toBe(0.0798)
        expect(curve[60].gain).toBe(0.0798)
        expect(curve[75].gain).toBe(0.4)
    })

    it('applies explicit dramatic silence windows forcing ambient floor to -24 dB', () => {
        const curve = computeMultiWindowDuckingCurve(
            [{ shot_id: 'w1', from_frame: 10, to_frame: 30 }],
            60,
            0.4,
            -14.0,
            [{ from_frame: 35, to_frame: 50, duck_ambient_db: -24.0 }],
        )

        expect(curve[20].gain).toBe(0.0798)
        expect(curve[40].gain).toBe(0.0252)
    })

    it('verifies deterministic Foley transient placement via MurmurHash3', () => {
        const seed1 = murmurHash3('ep01_sc01:shot_01:mud_squelch')
        const seed2 = murmurHash3('ep01_sc01:shot_01:mud_squelch')
        const seed3 = murmurHash3('ep01_sc01:shot_02:mud_squelch')

        expect(seed1).toBe(seed2)
        expect(seed1).not.toBe(seed3)

        const samples = ['squelch_01.wav', 'squelch_02.wav', 'squelch_03.wav']
        const cue = resolveDeterministicFoleyCue(
            'ep01_sc01',
            'shot_01',
            'mud_squelch',
            15,
            samples,
        )

        expect(cue.shot_id).toBe('shot_01')
        expect(cue.frame_offset).toBe(15)
        expect(samples).toContain(cue.resolved_sample)
    })

    it('asserts 100% 7-bit clean ASCII compliance across audio unit files', () => {
        const files = [
            'packages/400.conductor/32.audio.unit/fce/audio.interface.ts',
            'packages/400.conductor/32.audio.unit/fce/audio.bit.ts',
            'packages/400.conductor/32.audio.unit/buz/acousticDucking.buzz.ts',
            'packages/400.conductor/32.audio.unit/audio.action.ts',
            'packages/400.conductor/32.audio.unit/audio.model.ts',
            'packages/400.conductor/32.audio.unit/audio.buzzer.ts',
            'packages/400.conductor/32.audio.unit/audio.reduce.ts',
            'packages/400.conductor/val/acousticClock.test.ts',
        ]

        const packageRoot = path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            '..',
        )
        for (const rel of files) {
            const full = path.resolve(
                packageRoot,
                rel.replace('packages/400.conductor/', ''),
            )
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                expect(/[\u0080-\uFFFF]/.test(content)).toBe(false)
            }
        }
    })

    it('fails closed in computeDuckingCurve when totalFrames <= 0', async () => {
        let val = 0
        await computeDuckingCurve(new AudioModel(), {
            idx: 'test-invalid-frames',
            dat: { totalFrames: 0 },
            slv: (res: any) => {
                val = res.audBit.val
            },
        })
        expect(val).toBe(-1)
    })

    it('streams [6] COMPUTE ACOUSTIC DUCKING CURVE telemetry to cns00 via runAcousticDuckingMenu', async () => {
        expect(COMPUTE_DUCKING_LABEL).toBe('[6] COMPUTE ACOUSTIC DUCKING CURVE')
        const lines: string[] = []
        let resolved: any = null

        const mockState = {
            hunt: async (action: string, bale: any) => {
                if (action === '[Console action] Update Console' && bale?.src) {
                    lines.push(bale.src)
                    return {}
                }
                if (action === '[Audio action] Compute Ducking Curve') {
                    let computed: any = null
                    await computeDuckingCurve(
                        new AudioModel(),
                        {
                            ...bale,
                            slv: (r: any) => {
                                computed = r
                            },
                        },
                        mockState as any,
                    )
                    return computed
                }
                return {}
            },
        } as any

        await runAcousticDuckingMenu(
            new MenuModel(),
            {
                idx: 'test-menu-ducking',
                slv: (res: any) => {
                    resolved = res
                },
            },
            mockState,
        )

        expect(resolved?.mnuBit?.idx).toBe('run-acoustic-ducking-menu')
        expect(resolved?.mnuBit?.val).toBe(0)
        expect(lines.some((l) => l.includes('[DUCKING:INIT]'))).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[DUCKING:WINDOWS] 2 dialogue window(s) detected: [10-30], [38-60]',
                ),
            ),
        ).toBe(true)
        expect(lines.some((l) => l.includes('[DUCKING:ANTI-PUMP]'))).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    'Generated 100 gain keyframes (Base=0.4, Ducked=0.0798 at -14 dB)',
                ),
            ),
        ).toBe(true)
        expect(lines.some((l) => l.includes('[FOLEY:SEED]'))).toBe(true)
    })
})
