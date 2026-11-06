import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ZodError } from 'zod'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import * as Buzz from '../98.menu.unit/buz/00.menu.buzz.js'
import * as Stream from '../98.menu.unit/buz/telemetryStreamer.buzz.js'
import {
    GridCoordinatesSchema,
    MenuChoiceItemSchema,
    CockpitTelemetryPacketSchema,
} from '../98.menu.unit/val/menu.val.js'

describe('98.menu.unit: Blessed Terminal Cockpit Navigation & Telemetry Control', () => {
    let model: MenuModel

    beforeEach(() => {
        model = new MenuModel()
    })

    afterEach(() => {
        delete (global as any).MICROSERVICEAUDIO
        delete (global as any).PIVOTS
        delete (global as any).LIBRARY
        vi.restoreAllMocks()
    })

    describe('Level 2: Strict Schema Closure & 12x12 Cartesian Grid Layout Traps', () => {
        it('strictly rejects un-schemaed keys via .strict() enforcement on all schemas', () => {
            // GridCoordinatesSchema rejection
            expect(() => {
                GridCoordinatesSchema.parse({
                    x: 0,
                    y: 4,
                    xSpan: 4,
                    ySpan: 8,
                    theme_color: 'amber',
                })
            }).toThrowError(ZodError)

            // MenuChoiceItemSchema rejection
            expect(() => {
                MenuChoiceItemSchema.parse({
                    id: 'CHOICE_AST_AUDIT',
                    label: 'AUDIT DIALOGUE AST CONTRACT',
                    tooltip: 'Validate dialogue AST',
                    actionType: '[Abstractsyntaxtree action] Parse Scene AST',
                    active_tab: 1,
                })
            }).toThrowError(ZodError)

            // CockpitTelemetryPacketSchema rejection
            expect(() => {
                CockpitTelemetryPacketSchema.parse({
                    timestamp: '2026-11-06T09:00:00Z',
                    subsystem: 'CONDUCTOR',
                    level: 'INFO',
                    message: 'System nominal',
                    extra_key: 'trap',
                })
            }).toThrowError(ZodError)
        })

        it('asserts 12x12 Cartesian grid coordinate bounds and zero overlap', () => {
            expect(Buzz.CONDUCTOR_GRID_LEFT).toEqual({
                x: 0,
                y: 4,
                xSpan: 4,
                ySpan: 8,
            })
            expect(Buzz.CONDUCTOR_GRID_RIGHT).toEqual({
                x: 4,
                y: 0,
                xSpan: 8,
                ySpan: 12,
            })

            expect(
                Buzz.CONDUCTOR_GRID_LEFT.x + Buzz.CONDUCTOR_GRID_LEFT.xSpan,
            ).toBeLessThanOrEqual(12)
            expect(
                Buzz.CONDUCTOR_GRID_LEFT.y + Buzz.CONDUCTOR_GRID_LEFT.ySpan,
            ).toBeLessThanOrEqual(12)
            expect(
                Buzz.CONDUCTOR_GRID_RIGHT.x + Buzz.CONDUCTOR_GRID_RIGHT.xSpan,
            ).toBeLessThanOrEqual(12)
            expect(
                Buzz.CONDUCTOR_GRID_RIGHT.y + Buzz.CONDUCTOR_GRID_RIGHT.ySpan,
            ).toBeLessThanOrEqual(12)

            expect(
                Buzz.CONDUCTOR_GRID_LEFT.x + Buzz.CONDUCTOR_GRID_LEFT.xSpan,
            ).toBeLessThanOrEqual(Buzz.CONDUCTOR_GRID_RIGHT.x)
        })
    })

    describe('Level 3: Pure 7-Bit Clean ASCII Sanitization & Telemetry Formatting Traps', () => {
        it('strips multi-byte unicode emojis and typography quotes in sanitizeTo7BitAscii', () => {
            const raw =
                'Bog said: \u201CTighten the valve!\u201D \uD83D\uDD27 \u2014 status: active.'
            const sanitized = Stream.sanitizeTo7BitAscii(raw)
            expect(sanitized).toBe(
                'Bog said: "Tighten the valve!"  - status: active.',
            )
            expect(/[\x80-\xFF]/.test(sanitized)).toBe(false)
        })

        it('formats telemetry receipts with correct bracketed status tokens', () => {
            const okLine = Stream.formatTelemetryLine(
                'SUBSYSTEM',
                'Pipeline active',
                'OK',
            )
            expect(okLine).toBe('>> [SUBSYSTEM] [OK] Pipeline active')

            const failLine = Stream.formatTelemetryLine(
                'SUBSYSTEM',
                'Fatal boundary drop',
                'FAIL',
            )
            expect(failLine).toBe(':: [SUBSYSTEM] [FAIL] Fatal boundary drop')

            const warnLine = Stream.formatTelemetryLine(
                'SUBSYSTEM',
                'Degraded mode',
                'WARN',
            )
            expect(warnLine).toBe(':: [SUBSYSTEM] [WARN] Degraded mode')
        })

        it('streams non-blocking telemetry to cns00 when global.LIBRARY is present', async () => {
            const mockHunt = vi.fn().mockResolvedValue({ success: true })
            ;(global as any).LIBRARY = { hunt: mockHunt }

            await Stream.streamConsoleTelemetry(
                '>> [STATUS] Flight deck ready',
                'cns00',
            )

            expect(mockHunt).toHaveBeenCalledWith(
                '[Console action] Update Console',
                {
                    idx: 'cns00',
                    src: '>> [STATUS] Flight deck ready',
                },
            )
        })

        it('degrades gracefully to stdout in headless environment without crashing', async () => {
            delete (global as any).LIBRARY
            const writeSpy = vi
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true)

            await Stream.streamConsoleTelemetry(
                '>> [HEADLESS] Telemetry logged',
            )

            expect(writeSpy).toHaveBeenCalledWith(
                '>> [HEADLESS] Telemetry logged\n',
            )
        })
    })

    describe('Level 4: Interactive Choice Switchboard & Remote Audio Pivot Traps', () => {
        it('verifies complete 7-choice pipeline roster in CONDUCTOR_MENU_CHOICES', () => {
            const labels = Buzz.CONDUCTOR_MENU_CHOICES.map((c) => c.label)
            expect(labels).toEqual([
                'AUDIT DIALOGUE AST CONTRACT',
                'INSPECT CHARACTER SOMATIC DSP',
                'SYNTHESIZE SCENE AUDIO STEMS',
                'QUANTIZE ACOUSTIC MASTER CLOCK',
                'ASSEMBLE ACOUSTIC EXPOSURE SHEET',
                'DISPATCH REMOTE AUDIO PIVOT',
                'ROOT MENU',
            ])
        })

        it('invokes choice focus callback cb and streams operational tooltip to cns00', async () => {
            const mockLibHunt = vi
                .fn()
                .mockImplementation((action: string, payload: any) => {
                    if (
                        action === '[Choice action] Open Choice' &&
                        typeof payload.cb === 'function'
                    ) {
                        // Trigger cb for index 1 (INSPECT CHARACTER SOMATIC DSP)
                        payload.cb(1)
                        return Promise.resolve({ chcBit: { src: 'ROOT MENU' } })
                    }
                    return Promise.resolve({ grdBit: { dat: {} } })
                })
            ;(global as any).LIBRARY = { hunt: mockLibHunt }

            const bale = { idx: 'test-cb', slv: vi.fn() }
            await Buzz.updateMenu(model, bale, { hunt: vi.fn() } as any)

            expect(mockLibHunt).toHaveBeenCalledWith(
                '[Console action] Update Console',
                expect.objectContaining({
                    idx: 'cns00',
                    src: '>> [TOOLTIP] Convert physical fatigue and trauma metrics into continuous DSP modifiers.',
                }),
            )
        })

        it('warns cleanly when remote pivot global.MICROSERVICEAUDIO is absent', async () => {
            delete (global as any).MICROSERVICEAUDIO
            delete (global as any).PIVOTS

            const slv = vi.fn()
            const writeSpy = vi
                .spyOn(process.stdout, 'write')
                .mockImplementation(() => true)

            const updated = await Buzz.dispatchRemoteAudioPivot(
                model,
                { idx: 'test-warn', slv },
                null as any,
            )

            expect(slv).toHaveBeenCalledWith({
                mnuBit: { idx: 'dispatch-remote-audio-pivot-warn' },
            })
            expect(writeSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    ':: [AUDIO-MICROSERVICE] [WARN] Remote pivot [microserviceaudio] not found in global registry.',
                ),
            )
            expect(updated).toBeDefined()
        })

        it('dispatches remote action to global.MICROSERVICEAUDIO pivot when available', async () => {
            const mockHunt = vi.fn().mockResolvedValue({ success: true })
            ;(global as any).MICROSERVICEAUDIO = { hunt: mockHunt }
            ;(global as any).LIBRARY = { hunt: vi.fn().mockResolvedValue({}) }

            const slv = vi.fn()
            const updated = await Buzz.dispatchRemoteAudioPivot(
                model,
                { idx: 'test-pivot', slv },
                null as any,
            )

            expect(mockHunt).toHaveBeenCalledWith(
                '[Microserviceaudio action] Update Microserviceaudio',
                expect.objectContaining({
                    content: 'Remote Conductor Handshake',
                }),
            )
            expect(slv).toHaveBeenCalledWith(
                expect.objectContaining({
                    mnuBit: expect.objectContaining({
                        idx: 'dispatch-remote-audio-pivot-success',
                    }),
                }),
            )
            expect(updated).toBeDefined()
        })

        it('schedules next tick via non-recursive setTimeout(..., 333)', async () => {
            vi.useFakeTimers()
            const mockLibHunt = vi.fn().mockImplementation((action: string) => {
                if (action === '[Choice action] Open Choice') {
                    return Promise.resolve({
                        chcBit: { src: 'AUDIT DIALOGUE AST CONTRACT' },
                    })
                }
                return Promise.resolve({ grdBit: { dat: {} } })
            })
            ;(global as any).LIBRARY = { hunt: mockLibHunt }

            const steHunt = vi.fn().mockResolvedValue({})
            const ste = { hunt: steHunt } as any

            await Buzz.updateMenu(
                model,
                { idx: 'test-tick', slv: vi.fn() },
                ste,
            )

            expect(steHunt).toHaveBeenCalledWith(
                '[Abstractsyntaxtree action] Parse Scene AST',
                {
                    dat: { filePath: './drafts/dialogue_ast.json' },
                },
            )

            // Assert steHunt has not yet received UPDATE_MENU before 333ms
            expect(steHunt).not.toHaveBeenCalledWith(
                '[Menu action] Update Menu',
                {},
            )

            vi.advanceTimersByTime(333)

            expect(steHunt).toHaveBeenCalledWith(
                '[Menu action] Update Menu',
                {},
            )
            vi.useRealTimers()
        })
    })
})
