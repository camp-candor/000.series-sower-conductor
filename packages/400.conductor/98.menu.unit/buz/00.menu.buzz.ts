import { MenuModel } from '../menu.model.js'
import MenuBit from '../fce/menu.bit.js'
import State from '../../99.core/state.js'
import * as ActMnu from '../menu.action.js'
import * as ActCnd from '../../00.conductor.unit/conductor.action.js'
import * as ActCpu from '../../28.cpus.unit/cpus.action.js'
import * as ActCud from '../../27.cuda.unit/cuda.action.js'
import * as ActSql from '../../08.sqlite.unit/sqlite.action.js'
import * as ActAst from '../../33.asset.unit/asset.action.js'
import * as ActVrm from '../../26.vram.unit/vram.action.js'
import * as Align from '../../val/align.js'
import * as Color from '../../val/console-color.js'

let rootResolver: Function | null = null

export const logToConsole = async (ste: State, msg: string): Promise<void> => {
    const lib = (globalThis as any).LIBRARY
    if (lib && typeof lib.hunt === 'function') {
        await lib.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: msg,
        })
    } else {
        process.stdout.write(`${msg}\n`)
    }
}

export const initMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    const cns = '>> [FLIGHT-DECK]'
    if (bal.slv) rootResolver = bal.slv

    const lib = (globalThis as any).LIBRARY
    if (lib && typeof lib.hunt === 'function') {
        const gridConsole = await lib.hunt('[Grid action] Update Grid', {
            x: 4,
            y: 0,
            xSpan: 8,
            ySpan: 12,
        })
        await lib.hunt('[Write action] Write Console', {
            idx: 'cns00',
            src: '',
            dat: { net: gridConsole?.grdBit?.dat, src: 'alligator0' },
        })
    }

    await logToConsole(
        ste,
        '================================================================',
    )
    await logToConsole(
        ste,
        '>> SERIES SOWER CONDUCTOR // FLIGHT DECK (packages/400.conductor)',
    )
    await logToConsole(
        ste,
        '>> HOST: RIG 1 | ZERO-VRAM POLICY: ENFORCED | T_0: $0.00 SPEND',
    )
    await logToConsole(
        ste,
        '================================================================',
    )

    cpy.statusMessage = 'READY'
    if (lib && typeof lib.hunt === 'function') {
        await updateMenu(cpy, bal, ste)
        return cpy
    }

    if (bal.slv && !bal.src) {
        bal.slv({ menuBit: { idx: 'init-menu', val: 1 } })
    }
    return cpy
}

export const updateMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    const lib = (globalThis as any).LIBRARY

    const choices = [
        'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
        'VERIFY RIG 1 HARDWARE & ZERO-VRAM',
        'INSPECT SQLITE CONTINUITY LEDGER',
        'VERIFY 3D ASSET TREE PARITY',
        'TRIGGER PRE-SYNTHESIS VRAM FLUSH',
        'ROOT MENU',
    ]

    const tooltips: Record<string, string> = {
        'RUN MASTER SCENE LIFECYCLE (ep01_sc01)':
            '- Execute fail-closed 4-step pipeline:\n  AST Parse -> Continuity -> VRAM Flush -> Speech Synthesis.',
        'VERIFY RIG 1 HARDWARE & ZERO-VRAM':
            '- Inspect CPU cores, RAM floor, POSIX binaries (ffprobe, git),\n  and enforce 0MB dedicated VRAM on Rig 1.',
        'INSPECT SQLITE CONTINUITY LEDGER':
            '- Query local SQLite fact ledger (pilot.db)\n  and assert WAL pragmas & trigger health.',
        'VERIFY 3D ASSET TREE PARITY':
            '- Verify live Git tree hashes for characters, environments,\n  and props against manifest.json at T_0 = $0.00.',
        'TRIGGER PRE-SYNTHESIS VRAM FLUSH':
            '- Dispatch POST :8188/free and poll memory\n  until GPU free VRAM recovers to baseline envelope.',
        'ROOT MENU': '- Return to the main library switchboard.',
    }

    if (!lib || typeof lib.hunt !== 'function') {
        // Headless testing execution fallback
        cpy.activeSelection = bal.src || 'HEADLESS'
        cpy.lastActionTimestamp = Date.now()
        if (bal.slv)
            bal.slv({
                menuBit: {
                    idx: 'update-menu-headless',
                    val: 1,
                    src: cpy.activeSelection,
                },
            })
        return cpy
    }

    const gridChoice = await lib.hunt('[Grid action] Update Grid', {
        x: 0,
        y: 4,
        xSpan: 4,
        ySpan: 8,
    })

    const selection = await lib.hunt('[Open action] Open Choice', {
        x: 0,
        y: 4,
        xSpan: 4,
        ySpan: 8,
        dat: { clr0: Color.BLACK, clr1: Color.YELLOW },
        src: Align.VERTICAL,
        net: gridChoice?.grdBit?.dat,
        lst: choices,
        cb: async (focusedItem: string) => {
            const tip = tooltips[focusedItem]
            if (tip) await logToConsole(ste, `:: [HELP] ${focusedItem}\n${tip}`)
        },
    })

    const choice = selection?.src || selection?.openBit?.src || ''
    cpy.activeSelection = choice
    cpy.lastActionTimestamp = Date.now()

    switch (choice) {
        case 'RUN MASTER SCENE LIFECYCLE (ep01_sc01)':
            await logToConsole(
                ste,
                '>> [EXEC] Launching Master Scene Lifecycle for ep01_sc01...',
            )
            await ste.hunt(ActCnd.RUN_SCENE_LIFECYCLE, {
                src: 'drafts/dialogue_ast.json',
            })
            break

        case 'VERIFY RIG 1 HARDWARE & ZERO-VRAM':
            await logToConsole(
                ste,
                '>> [EXEC] Auditing Rig 1 POSIX Hardware & Zero-VRAM policy...',
            )
            await ste.hunt(ActCpu.VERIFY_HARDWARE_PREFLIGHT, {})
            await ste.hunt(ActCud.ASSERT_ZERO_VRAM, {})
            break

        case 'INSPECT SQLITE CONTINUITY LEDGER':
            await logToConsole(
                ste,
                '>> [EXEC] Opening local SQLite Continuity Ledger (pilot.db)...',
            )
            await ste.hunt(ActSql.OPEN_SQLITE_LEDGER, {
                src: 'data/sqlite/pilot.db',
            })
            break

        case 'VERIFY 3D ASSET TREE PARITY':
            await logToConsole(
                ste,
                '>> [EXEC] Verifying 3D Asset Tree Parity against manifest.json...',
            )
            await ste.hunt(ActAst.VERIFY_ASSET_PARITY, {
                src: 'wiregrass-basin',
            })
            break

        case 'TRIGGER PRE-SYNTHESIS VRAM FLUSH':
            await logToConsole(
                ste,
                '>> [EXEC] Triggering ComfyUI Port 8188 VRAM Evacuation...',
            )
            await ste.hunt(ActVrm.EXECUTE_VRAM_HYGIENE, {
                src: 'http://127.0.0.1:8188',
            })
            break

        case 'ROOT MENU':
            if (rootResolver) {
                rootResolver({ menuBit: { idx: 'root-menu', val: 1 } })
            }
            if (bal.slv) {
                bal.slv({ menuBit: { idx: 'root-menu', val: 1 } })
            }
            return cpy

        default:
            await logToConsole(
                ste,
                `:: [WARN] Unhandled menu selection: ${choice}`,
            )
            break
    }

    // Schedule next menu render tick non-recursively
    setTimeout(async () => {
        await ste.hunt(ActMnu.UPDATE_MENU, {})
    }, 333)

    return cpy
}
