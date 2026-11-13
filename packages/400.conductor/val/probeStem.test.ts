import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
    probeStemDuration,
    EMPTY_SHA256,
} from '../24.frame.unit/buz/probeStem.buzz.js'
import { FrameModel } from '../24.frame.unit/frame.model.js'
import type FrameBit from '../24.frame.unit/fce/frame.bit.js'
import {
    PROBE_STEM_LABEL,
    runStemProbeMenu,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('Feature 2.1 Uncompressed Stem Duration Probing', () => {
    const model = new FrameModel()
    const tmpDir = path.resolve(__dirname, '../val/tmp_test_audio')

    beforeAll(() => {
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterAll(() => {
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true })
        }
    })

    it('probes a valid audio stem using mock duration injection', async () => {
        const bal: FrameBit = {
            idx: 'test-valid-stem',
            dat: {
                probeRequest: {
                    shot_id: 'shot_101',
                    wav_path: 'mock/path/audio.wav',
                    mock_duration_ms: 3120,
                },
            },
            slv: (res) => {
                const result = res.frmBit.dat?.probeResult
                expect(result).toBeDefined()
                expect(result?.ok).toBe(true)
                expect(result?.duration_ms).toBe(3120)
                expect(result?.sample_count).toBe(149760) // 3.120 * 48000
                expect(result?.audio_spec.sample_rate_hz).toBe(48000)
            },
        }

        await probeStemDuration(model, bal)
    })

    it('fails closed when encountering a zero-byte poisoned stem', async () => {
        const poisonFile = path.join(tmpDir, 'zero_byte.wav')
        fs.writeFileSync(poisonFile, Buffer.alloc(0))

        let failed = false
        const bal: FrameBit = {
            idx: 'test-zero-byte',
            dat: {
                probeRequest: {
                    shot_id: 'shot_poison',
                    wav_path: poisonFile,
                },
            },
            slv: (res) => {
                failed = true
                const result = res.frmBit.dat?.probeResult
                expect(result?.ok).toBe(false)
                expect(result?.error).toContain('ZERO_BYTE_POISON')
            },
        }

        await probeStemDuration(model, bal)
        expect(failed).toBe(true)
    })

    it('fails closed when file size is under the 1024-byte header threshold', async () => {
        const corruptFile = path.join(tmpDir, 'corrupt_short.wav')
        fs.writeFileSync(corruptFile, Buffer.alloc(512, 0x41))

        let failed = false
        const bal: FrameBit = {
            idx: 'test-short-header',
            dat: {
                probeRequest: {
                    shot_id: 'shot_corrupt',
                    wav_path: corruptFile,
                },
            },
            slv: (res) => {
                failed = true
                const result = res.frmBit.dat?.probeResult
                expect(result?.ok).toBe(false)
                expect(result?.error).toContain('ZERO_BYTE_POISON')
            },
        }

        await probeStemDuration(model, bal)
        expect(failed).toBe(true)
    })

    it('verifies 100% 7-bit clean ASCII compliance in probe source files', () => {
        const probeFile = path.resolve(
            __dirname,
            '../24.frame.unit/buz/probeStem.buzz.ts',
        )
        const content = fs.readFileSync(probeFile, 'utf8')
        expect(/[\u0080-\uFFFF]/.test(content)).toBe(false)
    })

    it('fails closed on missing probeRequest or non-existent wav_path without mockDurationMs', async () => {
        expect(EMPTY_SHA256).toBe(
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        )

        let missingReqErr = ''
        await probeStemDuration(model, {
            idx: 'test-missing-req',
            slv: (res) => {
                missingReqErr = res.frmBit.dat?.probeResult?.error || ''
            },
        })
        expect(missingReqErr).toContain('PROBE_ERROR')

        let notFoundErr = ''
        await probeStemDuration(model, {
            idx: 'test-not-found',
            dat: {
                probeRequest: {
                    shot_id: 'shot_missing',
                    wav_path: path.join(tmpDir, 'does_not_exist.wav'),
                },
            },
            slv: (res) => {
                notFoundErr = res.frmBit.dat?.probeResult?.error || ''
            },
        })
        expect(notFoundErr).toContain('FILE_NOT_FOUND')
    })

    it('streams [2] PROBE UNCOMPRESSED STEM DURATION telemetry to cns00 via runStemProbeMenu', async () => {
        expect(PROBE_STEM_LABEL).toBe('[2] PROBE UNCOMPRESSED STEM DURATION')
        const lines: string[] = []
        let resolved: any = null

        const mockState = {
            hunt: async (action: string, bale: any) => {
                if (action === '[Console action] Update Console' && bale?.src) {
                    lines.push(bale.src)
                    return {}
                }
                if (action === '[Frame action] Probe Stem Duration') {
                    let probed: any = null
                    await probeStemDuration(
                        new FrameModel(),
                        {
                            ...bale,
                            slv: (r: any) => {
                                probed = r
                            },
                        },
                        mockState as any,
                    )
                    return probed
                }
                return {}
            },
        } as any

        await runStemProbeMenu(
            new MenuModel(),
            {
                idx: 'test-menu-probe',
                slv: (res: any) => {
                    resolved = res
                },
            },
            mockState,
        )

        expect(resolved?.mnuBit?.idx).toBe('run-stem-probe-menu')
        expect(resolved?.mnuBit?.val).toBe(0)
        expect(lines.some((l) => l.includes('[PROBE:INIT]'))).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[PROBE:OK] [ep01_sc01_sh01]: 3120ms (149760 samples, 288044 bytes)',
                ),
            ),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[PROBE:SPEC] 48000Hz | 24-bit | pcm_s24le | mono verified',
                ),
            ),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[POISON-GUARD] [OK] File size > 1024 bytes and SHA-256 non-empty',
                ),
            ),
        ).toBe(true)
    })
})
