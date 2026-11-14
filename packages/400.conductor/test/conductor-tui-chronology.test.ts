import { describe, it, expect, vi } from 'vitest'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import {
    CONDUCTOR_TIMECODE_LABEL,
    CONDUCTOR_MENU_CHOICES,
    runConductorTimecodeAudit,
    updateMenu,
    resolveAuditChronology,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { AUDIT_CONDUCTOR_TIMECODE } from '../98.menu.unit/menu.action.js'
import { CockpitTelemetryPacketSchema } from '../98.menu.unit/val/menu.val.js'

describe('Conductor TUI Chronology Telemetry', () => {
    it('exposes audit conductor timecode action', () => {
        expect(AUDIT_CONDUCTOR_TIMECODE).toBe(
            '[Menu action] Audit Conductor Timecode',
        )
        expect(CONDUCTOR_TIMECODE_LABEL).toBe(
            '[T] INSPECT EPISODE CHRONOLOGY TIMECODE',
        )
    })

    it('registers timecode choice in conductor menu', () => {
        const found = CONDUCTOR_MENU_CHOICES.find(
            (c) => c.label === CONDUCTOR_TIMECODE_LABEL,
        )
        expect(found).toBeDefined()
        expect(found?.id).toBe('CHOICE_CONDUCTOR_TIMECODE')
    })

    it('dispatches audit headlessly emitting chrono telemetry', async () => {
        const cpy = new MenuModel()
        const lines: string[] = []
        const orig = (global as any).LIBRARY
        ;(global as any).LIBRARY = {
            hunt: vi.fn(async (_cmd: string, pkt: any) => {
                if (pkt?.idx === 'cns00' && typeof pkt?.src === 'string')
                    lines.push(pkt.src)
                return {}
            }),
        }
        let slvPayload: any = null
        await runConductorTimecodeAudit(
            cpy,
            {
                idx: 't',
                dat: {
                    dialogueAst: {
                        chronology: {
                            start_date: '2026-10-31',
                            start_time_hm: '21:15',
                            timecode_smpte: '00:02:00:00',
                            daypart: 'NIGHT',
                            tick_seconds: 60,
                            frames_per_second: 24,
                        },
                    },
                    durationFrames: 48,
                },
                slv: (r: any) => {
                    slvPayload = r
                },
            } as any,
            undefined as any,
        )
        ;(global as any).LIBRARY = orig
        const chronoLine = lines.find((l) => l.includes('>> [COND:CHRONO]'))
        const tcLine = lines.find((l) => l.includes('>> [COND:TIMECODE]'))
        expect(chronoLine).toContain('2026-10-31')
        expect(chronoLine).toContain('21:15')
        expect(chronoLine).toContain('NIGHT')
        expect(tcLine).toContain('21:15:00:00 -> 21:15:01:23')
        expect(slvPayload?.mnuBit?.idx).toBe('audit-conductor-timecode-success')
        for (const l of lines) {
            expect(() =>
                CockpitTelemetryPacketSchema.parse({
                    timestamp: new Date().toISOString(),
                    subsystem: 'COND',
                    level: 'INFO',
                    message: l,
                }),
            ).not.toThrow()
        }
    })

    it('routes headless updateMenu to timecode audit', async () => {
        const cpy = new MenuModel()
        const orig = (global as any).LIBRARY
        ;(global as any).LIBRARY = undefined
        const { streamConsoleTelemetry } =
            await import('../98.menu.unit/buz/telemetryStreamer.buzz.js')
        void streamConsoleTelemetry
        const spy: string[] = []
        const proc = process.stdout.write.bind(process.stdout)
        ;(process.stdout.write as any) = (s: string) => {
            spy.push(String(s))
            return true
        }
        await updateMenu(
            cpy,
            {
                idx: 't',
                src: CONDUCTOR_TIMECODE_LABEL,
                dat: { durationFrames: 24 },
            } as any,
            undefined as any,
        )
        ;(process.stdout.write as any) = proc
        ;(global as any).LIBRARY = orig
        expect(cpy.activeSelection).toBe('CHOICE_CONDUCTOR_TIMECODE')
        expect(spy.join('')).toContain('COND:CHRONO')
    })

    it('resolves chronology handoff defaults plus packet compliance', () => {
        const chrono = resolveAuditChronology(
            { idx: 't', dat: { durationFrames: 24 } } as any,
            process.cwd(),
        )
        expect(chrono.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(() =>
            CockpitTelemetryPacketSchema.parse({
                timestamp: new Date().toISOString(),
                subsystem: 'COND',
                level: 'INFO',
                message: `>> [COND:CHRONO] Scene: ${chrono.sceneId} | Start ok`,
            }),
        ).not.toThrow()
    })
})
