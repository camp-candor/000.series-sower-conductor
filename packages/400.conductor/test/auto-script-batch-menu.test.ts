import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import {
    AUTO_SCRIPT_BATCH_LABEL,
    CONDUCTOR_MENU_CHOICES,
    runAutoScriptBatchIngestMenu,
    updateMenu,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { BATCH_INGEST_AUTO_SCRIPT_STACK } from '../98.menu.unit/menu.action.js'
import { CockpitTelemetryPacketSchema } from '../98.menu.unit/val/menu.val.js'

const makeScene = (
    date: string,
    time: string,
    cue: string,
) => `Title: Stack Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: test_scene
Date: ${date}
Start-Time: ${time}
Timecode: ${time}:00:00
Daypart: NIGHT

INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

${cue}
(whispers)
Miss Beverly, do you copy?

CUT TO:
`

describe('Conductor Auto-Script Batch Menu', () => {
    afterEach(() => {
        ;(global as any).LIBRARY = undefined
    })

    it('exposes batch ingest action plus menu choice', () => {
        expect(BATCH_INGEST_AUTO_SCRIPT_STACK).toBe(
            '[Menu action] Batch Ingest Auto-Script Stack',
        )
        expect(AUTO_SCRIPT_BATCH_LABEL).toBe('BATCH INGEST AUTO-SCRIPT STACK')
        const found = CONDUCTOR_MENU_CHOICES.find(
            (c) => c.label === AUTO_SCRIPT_BATCH_LABEL,
        )
        expect(found).toBeDefined()
        expect(found?.id).toBe('CHOICE_BATCH_INGEST_AUTO_SCRIPTS')
    })

    it('routes headless selection streaming stack summary to cns00', async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-menu-'))
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeScene('2026-10-31', '21:00', 'JOHNNY'),
            'utf8',
        )
        fs.writeFileSync(
            path.join(tmp, '0002_tick02.fountain'),
            makeScene('2026-10-31', '21:15', 'ORBIE'),
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
        await runAutoScriptBatchIngestMenu(
            cpy,
            {
                idx: 't',
                dat: { inputDir: tmp },
                slv: (r: any) => {
                    payload = r
                },
            } as any,
            undefined as any,
        )
        ;(global as any).LIBRARY = orig
        fs.rmSync(tmp, { recursive: true, force: true })
        expect(payload?.mnuBit?.idx).toBe('batch-ingest-auto-scripts')
        expect(payload?.mnuBit?.dat?.manifest?.scene_count).toBe(2)
        expect(payload?.mnuBit?.dat?.receipt?.manifest_sha256).toMatch(
            /^[0-9a-f]{64}$/,
        )
        const sceneLines = lines.filter((l) => l.includes('>> [BATCH:SCENE]'))
        expect(sceneLines.length).toBe(2)
        expect(sceneLines[0]).toContain('#0001')
        expect(sceneLines[0]).toContain('6-CAT: PASS')
        expect(lines.some((l) => l.includes('>> [BATCH:SEALED]'))).toBe(true)
        for (const l of lines) {
            expect(() =>
                CockpitTelemetryPacketSchema.parse({
                    timestamp: '2026-10-31T00:00:00.000Z',
                    subsystem: 'BATCH',
                    level: 'INFO',
                    message: l,
                }),
            ).not.toThrow()
            expect(/^[\x20-\x7E\r\n\t]*$/.test(l)).toBe(true)
        }
    })

    it('handles missing directory fail-closed', async () => {
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
        await runAutoScriptBatchIngestMenu(
            cpy,
            {
                idx: 't',
                dat: { inputDir: path.join(os.tmpdir(), 'no-such-dir-xyz') },
                slv: (r: any) => {
                    payload = r
                },
            } as any,
            undefined as any,
        )
        ;(global as any).LIBRARY = orig
        expect(lines.some((l) => l.includes(':: [BATCH:FAIL]'))).toBe(true)
        expect(payload?.mnuBit?.idx).toBe('batch-ingest-auto-scripts-error')
    })

    it('dispatches via updateMenu headless path', async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-menu-'))
        fs.writeFileSync(
            path.join(tmp, '0001_tick01.fountain'),
            makeScene('2026-10-31', '21:00', 'JOHNNY'),
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
                src: AUTO_SCRIPT_BATCH_LABEL,
                dat: { inputDir: tmp },
            } as any,
            undefined as any,
        )
        ;(process.stdout.write as any) = proc
        ;(global as any).LIBRARY = orig
        fs.rmSync(tmp, { recursive: true, force: true })
        expect(cpy.activeSelection).toBe('CHOICE_BATCH_INGEST_AUTO_SCRIPTS')
        expect(out.join('')).toContain('[BATCH:SCENE]')
    })
})
