import { describe, it, expect } from 'vitest'
import sim from '../hunt.js'
import * as ActMnu from '../98.menu.unit/menu.action.js'

describe('packages/400.conductor 98.menu.unit Blessed Flight Deck', () => {
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
})
