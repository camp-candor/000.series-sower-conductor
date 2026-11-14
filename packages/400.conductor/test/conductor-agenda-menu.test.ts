import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import {
    CHRONO_AGENDA_AUDIT_LABEL,
    CONDUCTOR_MENU_CHOICES,
    runConductorChronoAgendaAudit,
    updateMenu,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { AUDIT_CONDUCTOR_CHRONO_AGENDA } from '../98.menu.unit/menu.action.js'
import { CockpitTelemetryPacketSchema } from '../98.menu.unit/val/menu.val.js'

const makeAgendaScene = (
    date: string,
    time: string,
    cue: string,
    beatId?: string,
    scheduledTime?: string,
) => `Title: Agenda Audit Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: test_scene
Date: ${date}
Start-Time: ${time}
Timecode: ${time}:00:00
Daypart: NIGHT
${beatId ? `Agenda-Beat-Id: ${beatId}\n` : ''}${scheduledTime ? `Scheduled-Time: ${scheduledTime}\n` : ''}
INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

${cue}
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

describe('Conductor Agenda Audit Menu', () => {
    afterEach(() => {
        ;(global as any).LIBRARY = undefined
    })

    it('exposes audit action plus menu choice', () => {
        expect(AUDIT_CONDUCTOR_CHRONO_AGENDA).toBe(
            '[Menu action] Audit Conductor Chrono Agenda',
        )
        expect(CHRONO_AGENDA_AUDIT_LABEL).toBe(
            'AUDIT SCHEDULED CHRONO AGENDA STACK',
        )
        const found = CONDUCTOR_MENU_CHOICES.find(
            (c) => c.label === 'AUDIT SCHEDULED CHRONO AGENDA STACK',
        )
        expect(found).toBeDefined()
        expect(found?.id).toBe('CHOICE_AUDIT_CONDUCTOR_CHRONO_AGENDA')
    })

    it('routes headless selection streaming compliant match rows to cns00', async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-menu-'))
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene(
                '2026-10-31',
                '23:30',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:30',
            ),
            'utf8',
        )
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
        let payload: any = null
        await runConductorChronoAgendaAudit(
            cpy,
            {
                idx: 't',
                dat: {
                    inputDir: tmp,
                    expectedBeats: [
                        {
                            beat_id: 'curfew_2330',
                            isoDate: '2026-10-31',
                            startTimeHm: '23:30',
                        },
                    ],
                },
                slv: (r: any) => {
                    payload = r
                },
            } as any,
            undefined as any,
        )
        ;(global as any).LIBRARY = orig
        fs.rmSync(tmp, { recursive: true, force: true })
        expect(payload?.mnuBit?.idx).toBe(
            'audit-conductor-chrono-agenda-success',
        )
        expect(payload?.mnuBit?.dat?.compliance?.compliant).toBe(true)
        expect(payload?.mnuBit?.dat?.receipt?.manifest_sha256).toMatch(
            /^[0-9a-f]{64}$/,
        )
        const matchLines = lines.filter((l) =>
            l.includes('>> [AGENDA_AUDIT:MATCH]'),
        )
        expect(matchLines.length).toBe(1)
        expect(matchLines[0]).toContain('beat=curfew_2330')
        expect(matchLines[0]).toContain('delta=0s')
        expect(lines.some((l) => l.includes('>> [AGENDA_AUDIT:SEALED]'))).toBe(
            true,
        )
        for (const l of lines) {
            expect(() =>
                CockpitTelemetryPacketSchema.parse({
                    timestamp: '2026-10-31T00:00:00.000Z',
                    subsystem: 'AGENDA',
                    level: 'INFO',
                    message: l,
                }),
            ).not.toThrow()
            expect(/^[\x20-\x7E\r\n\t]*$/.test(l)).toBe(true)
        }
    })

    it('reports missed-beat alert without crashing', async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-menu-'))
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene(
                '2026-10-31',
                '21:00',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:30',
            ),
            'utf8',
        )
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
        let payload: any = null
        await runConductorChronoAgendaAudit(
            cpy,
            {
                idx: 't',
                dat: {
                    inputDir: tmp,
                    expectedBeats: [
                        {
                            beat_id: 'dawn_drop',
                            isoDate: '2026-11-01',
                            startTimeHm: '06:00',
                        },
                    ],
                },
                slv: (r: any) => {
                    payload = r
                },
            } as any,
            undefined as any,
        )
        ;(global as any).LIBRARY = orig
        fs.rmSync(tmp, { recursive: true, force: true })
        expect(lines.some((l) => l.includes(':: [AGENDA_AUDIT:MISS]'))).toBe(
            true,
        )
        expect(lines.some((l) => l.includes('beat=dawn_drop'))).toBe(true)
        expect(payload?.mnuBit?.dat?.compliance?.compliant).toBe(false)
    })

    it('guards missing directory fail-closed', async () => {
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
        let payload: any = null
        await runConductorChronoAgendaAudit(
            cpy,
            {
                idx: 't',
                dat: { inputDir: path.join(os.tmpdir(), 'no-such-agenda-xyz') },
                slv: (r: any) => {
                    payload = r
                },
            } as any,
            undefined as any,
        )
        ;(global as any).LIBRARY = orig
        expect(lines.some((l) => l.includes(':: [AGENDA_AUDIT:FAIL]'))).toBe(
            true,
        )
        expect(payload?.mnuBit?.idx).toBe('audit-conductor-chrono-agenda-error')
    })

    it('dispatches via updateMenu headless path', async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-menu-'))
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeAgendaScene(
                '2026-10-31',
                '23:30',
                'JOHNNY',
                'curfew_2330',
                '2026-10-31 23:30',
            ),
            'utf8',
        )
        const cpy = new MenuModel()
        const orig = (global as any).LIBRARY
        ;(global as any).LIBRARY = undefined
        const out: string[] = []
        const proc = process.stdout.write.bind(process.stdout)
        ;(process.stdout.write as any) = (s: string) => {
            out.push(String(s))
            return true
        }
        await updateMenu(
            cpy,
            {
                idx: 't',
                src: 'AUDIT SCHEDULED CHRONO AGENDA STACK',
                dat: {
                    inputDir: tmp,
                    expectedBeats: [
                        {
                            beat_id: 'curfew_2330',
                            isoDate: '2026-10-31',
                            startTimeHm: '23:30',
                        },
                    ],
                },
            } as any,
            undefined as any,
        )
        ;(process.stdout.write as any) = proc
        ;(global as any).LIBRARY = orig
        fs.rmSync(tmp, { recursive: true, force: true })
        expect(cpy.activeSelection).toBe('CHOICE_AUDIT_CONDUCTOR_CHRONO_AGENDA')
        expect(out.join('')).toContain('[AGENDA_AUDIT:MATCH]')
    })
})
