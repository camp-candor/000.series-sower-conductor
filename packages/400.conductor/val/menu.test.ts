import { describe, it, expect } from 'vitest'
import sim from '../hunt.js'
import * as ActMnu from '../98.menu.unit/menu.action.js'

describe('packages/400.conductor 98.menu.unit Blessed Flight Deck Remotion Integration', () => {
    it('initializes menu state cleanly in headless environment', async () => {
        const res = await sim.hunt!(ActMnu.INIT_MENU, {})
        expect(res).toBeDefined()
        expect(res.menuBit.val).toBe(1)
        expect(res.menuBit.idx).toBe('init-menu')
    })

    it('handles updateMenu headless execution without throwing null pointer errors', async () => {
        const res = await sim.hunt!(ActMnu.UPDATE_MENU, {
            src: 'STAMP STATIC REMOTION TSX (ep01)',
        })
        expect(res).toBeDefined()
        expect(res.menuBit.val).toBe(1)
        expect(res.menuBit.src).toBe('STAMP STATIC REMOTION TSX (ep01)')
        expect(res.menuBit.lst).toContain('STAMP STATIC REMOTION TSX (ep01)')
        expect(res.menuBit.lst).toContain('AUDIT REMOTION COMPOSITION AST')
        expect(res.menuBit.lst).toContain('SEAL UNIVERSAL PROVENANCE LOCKFILE')
    })

    it('updates model state selection when navigating AUDIT REMOTION COMPOSITION AST', async () => {
        const res = await sim.hunt!(ActMnu.UPDATE_MENU, {
            src: 'AUDIT REMOTION COMPOSITION AST',
        })
        expect(res.menuBit.src).toBe('AUDIT REMOTION COMPOSITION AST')
    })

    it('dispatches STAMP_REMOTION_MENU and returns valid menuBit structure', async () => {
        const res = await sim.hunt!(ActMnu.STAMP_REMOTION_MENU, {})
        expect(res).toBeDefined()
        expect(res.menuBit.src).toBe('STAMP STATIC REMOTION TSX (ep01)')
    })

    it('dispatches VERIFY_REMOTION_MENU and returns valid menuBit structure', async () => {
        const res = await sim.hunt!(ActMnu.VERIFY_REMOTION_MENU, {})
        expect(res).toBeDefined()
        expect(res.menuBit.src).toBe('AUDIT REMOTION COMPOSITION AST')
    })
})
