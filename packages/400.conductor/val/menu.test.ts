import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import sim from '../hunt.js'
import * as ActMnu from '../98.menu.unit/menu.action.js'
import { initMenu, updateMenu } from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'

describe('packages/400.conductor 98.menu.unit Blessed Flight Deck', () => {
    beforeEach(() => {
        delete (globalThis as any).LIBRARY
    })

    afterEach(() => {
        delete (globalThis as any).LIBRARY
    })

    it('initializes menu state cleanly in headless environment', async () => {
        const res = await sim.hunt!(ActMnu.INIT_MENU, {})
        expect(res).toBeDefined()
        expect(res.menuBit.val).toBe(1)
    })

    it('handles updateMenu headless execution without throwing null pointer errors', async () => {
        const res = await sim.hunt!(ActMnu.UPDATE_MENU, {
            src: 'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
        })
        expect(res).toBeDefined()
        expect(res.menuBit.val).toBe(1)
        expect(res.menuBit.src).toBe('RUN MASTER SCENE LIFECYCLE (ep01_sc01)')
    })

    it('updates model state selection and timestamp on menu update', async () => {
        const res = await sim.hunt!(ActMnu.UPDATE_MENU, {
            src: 'VERIFY RIG 1 HARDWARE & ZERO-VRAM',
        })
        expect(res.menuBit.src).toBe('VERIFY RIG 1 HARDWARE & ZERO-VRAM')
    })

    it('asserts the right 8 columns stream information via cns00 console pane', async () => {
        const dispatched: Array<{ action: string; bale: any }> = []
        ;(globalThis as any).LIBRARY = {
            hunt: async (action: string, bale: any) => {
                dispatched.push({ action, bale })
                if (action === '[Grid action] Update Grid') {
                    return {
                        grdBit: {
                            dat: {
                                x: bale.x,
                                y: bale.y,
                                xSpan: bale.xSpan,
                                ySpan: bale.ySpan,
                            },
                        },
                    }
                }
                if (action === '[Open action] Open Choice') {
                    return { src: 'ROOT MENU' }
                }
                return { val: 1 }
            },
        }

        const model = new MenuModel()
        await initMenu(model, { idx: 'test-init' }, {
            hunt: async () => {},
        } as any)

        // 1. Grid allocation for console pane must cover columns 4-12 (xSpan = 8, ySpan = 12)
        const gridConsoleAction = dispatched.find(
            (d) =>
                d.action === '[Grid action] Update Grid' &&
                d.bale.x === 4 &&
                d.bale.xSpan === 8,
        )
        expect(gridConsoleAction).toBeDefined()
        expect(gridConsoleAction?.bale.y).toBe(0)
        expect(gridConsoleAction?.bale.ySpan).toBe(12)

        // 2. Console widget cns00 must be mounted via WRITE_CONSOLE with grid net dat
        const writeConsoleAction = dispatched.find(
            (d) => d.action === '[Write action] Write Console',
        )
        expect(writeConsoleAction).toBeDefined()
        expect(writeConsoleAction?.bale.idx).toBe('cns00')
        expect(writeConsoleAction?.bale.dat?.net).toEqual({
            x: 4,
            y: 0,
            xSpan: 8,
            ySpan: 12,
        })

        // 3. Information logs must stream to cns00
        const consoleLogs = dispatched.filter(
            (d) =>
                d.action === '[Console action] Update Console' &&
                d.bale.idx === 'cns00',
        )
        expect(consoleLogs.length).toBeGreaterThan(0)
        const logTexts = consoleLogs.map((l) => l.bale.src).join('\n')
        expect(logTexts).toContain('FLIGHT DECK')
        expect(logTexts).toContain('RIG 1')
        expect(logTexts).toContain('ZERO-VRAM')
    })

    it('asserts the left 4 columns house the 6 interactive choices bound to grid net mesh', async () => {
        let capturedChoiceBale: any = null
        const tooltipLogs: string[] = []

        ;(globalThis as any).LIBRARY = {
            hunt: async (action: string, bale: any) => {
                if (action === '[Grid action] Update Grid') {
                    return {
                        grdBit: {
                            dat: {
                                left: `${(bale.x / 12) * 100}%`,
                                top: `${(bale.y / 12) * 100}%`,
                                width: `${(bale.xSpan / 12) * 100}%`,
                                height: `${(bale.ySpan / 12) * 100}%`,
                            },
                        },
                    }
                }
                if (action === '[Open action] Open Choice') {
                    capturedChoiceBale = bale
                    if (bale.cb) {
                        for (const item of bale.lst) {
                            await bale.cb(item)
                        }
                    }
                    return { src: 'ROOT MENU' }
                }
                if (action === '[Console action] Update Console') {
                    tooltipLogs.push(bale.src)
                }
                return { val: 1 }
            },
        }

        const model = new MenuModel()
        await updateMenu(model, { idx: 'test-update', slv: () => {} }, {
            hunt: async () => {},
        } as any)

        expect(capturedChoiceBale).toBeDefined()

        // 1. Grid geometry: Left 4 columns (x: 0, xSpan: 4, rows 4-12)
        expect(capturedChoiceBale.x).toBe(0)
        expect(capturedChoiceBale.xSpan).toBe(4)
        expect(capturedChoiceBale.y).toBe(4)
        expect(capturedChoiceBale.ySpan).toBe(8)

        // 2. Net mesh must be present to anchor choice widget and prevent 100% full-screen blowout
        expect(capturedChoiceBale.net).toBeDefined()
        expect(capturedChoiceBale.net.left).toBe('0%')
        expect(capturedChoiceBale.net.width).toBe(`${(4 / 12) * 100}%`)

        // 3. Must contain exactly the 6 interactive choices
        const expectedChoices = [
            'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
            'VERIFY RIG 1 HARDWARE & ZERO-VRAM',
            'INSPECT SQLITE CONTINUITY LEDGER',
            'VERIFY 3D ASSET TREE PARITY',
            'TRIGGER PRE-SYNTHESIS VRAM FLUSH',
            'ROOT MENU',
        ]
        expect(capturedChoiceBale.lst).toEqual(expectedChoices)
        expect(capturedChoiceBale.lst).toHaveLength(6)

        // 4. Focus callbacks must stream informative tooltips to the right panel for all 6 choices
        expect(tooltipLogs.length).toBeGreaterThanOrEqual(6)
        const combinedTooltips = tooltipLogs.join('\n')
        expect(combinedTooltips).toContain('AST Parse')
        expect(combinedTooltips).toContain('enforce 0MB dedicated VRAM')
        expect(combinedTooltips).toContain('pilot.db')
        expect(combinedTooltips).toContain('manifest.json')
        expect(combinedTooltips).toContain(':8188/free')
        expect(combinedTooltips).toContain('main library switchboard')
    })
})
