import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import { reducer } from '../98.menu.unit/menu.reduce.js'
import { initMenu, updateMenu } from '../98.menu.unit/buz/00.menu.buzz.js'
import * as ActMnu from '../98.menu.unit/menu.action.js'

describe('packages/400.conductor Phase 11: Blessed Terminal Flight Deck Control Surface', () => {
    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(
            process.cwd(),
            'packages/400.conductor/src',
        )
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('verifies immutable runner boundary has exactly 0 modified lines in apps/995.library/995.library/**', () => {
        const diff = execSync('git status -s apps/995.library/995.library/', {
            encoding: 'utf8',
        }).trim()
        expect(diff).toBe('')
    })

    it('handles headless execution safely when LIBRARY terminal singleton is absent', async () => {
        const model = new MenuModel()
        let resolvedBit: any = null

        // Simulate headless initMenu
        const updated = await initMenu(
            model,
            {
                idx: 'test-init',
                slv: (res: any) => {
                    resolvedBit = res
                },
            },
            {} as any,
        )

        expect(updated.statusMessage).toBe('IDLE')
        expect(resolvedBit).toBeDefined()
        expect(resolvedBit.mnuBit.idx).toBe('init-menu')
    })

    it('routes menu action switchboard dispatches cleanly through reducer', async () => {
        const model = new MenuModel()
        let resolvedBit: any = null

        const action = new ActMnu.UpdateMenu({
            idx: 'test-action',
            slv: (res: any) => {
                resolvedBit = res
            },
        })

        const updated = await reducer(model, action, {} as any)
        expect(updated.idx).toBe('98.menu')
    })

    it('resolves rootSlv and returns cleanly when ROOT MENU is selected', async () => {
        let rootSlvResolved: any = null
        const mockHunt = (action: string) => {
            if (action === '[Open action] Open Choice') {
                return Promise.resolve({ chcBit: { src: 'ROOT MENU' } })
            }
            return Promise.resolve({ grdBit: { dat: {} } })
        }
        ;(global as any).LIBRARY = { hunt: mockHunt }

        const model = new MenuModel()
        // Save rootSlv in initMenu
        await initMenu(
            model,
            {
                idx: 'init-test',
                slv: (res: any) => {
                    rootSlvResolved = res
                },
            },
            {} as any,
        )

        // Run updateMenu where user selects ROOT MENU
        const updated = await updateMenu(model, {} as any, {} as any)
        expect(updated).toBeDefined()
        expect(rootSlvResolved).toBeDefined()
        expect(rootSlvResolved.mnuBit.idx).toBe('root-menu')

        delete (global as any).LIBRARY
    })

    it('falls back to global.LIBRARY Open Menu if rootSlv was not provided', async () => {
        let openMenuTriggered = false
        const mockHunt = (action: string) => {
            if (action === '[Open action] Open Choice') {
                return Promise.resolve({ chcBit: { src: 'ROOT MENU' } })
            }
            if (action === '[Menu action] Open Menu') {
                openMenuTriggered = true
                return Promise.resolve({})
            }
            return Promise.resolve({ grdBit: { dat: {} } })
        }
        ;(global as any).LIBRARY = { hunt: mockHunt }

        const model = new MenuModel()
        // Run updateMenu without initMenu/slv
        await updateMenu(model, {} as any, {} as any)
        expect(openMenuTriggered).toBe(true)

        delete (global as any).LIBRARY
    })

    it('asserts 100% pure 7-bit ASCII compliance across all menu unit files', () => {
        const files = [
            'packages/400.conductor/98.menu.unit/fce/menu.interface.ts',
            'packages/400.conductor/98.menu.unit/fce/menu.bit.ts',
            'packages/400.conductor/98.menu.unit/menu.action.ts',
            'packages/400.conductor/98.menu.unit/menu.model.ts',
            'packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts',
            'packages/400.conductor/98.menu.unit/menu.buzzer.ts',
            'packages/400.conductor/98.menu.unit/menu.reduce.ts',
        ]

        for (const rel of files) {
            const full = path.resolve(process.cwd(), rel)
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                // eslint-disable-next-line no-control-regex
                const match = content.match(/[\u0080-\uFFFF]/)
                expect(match).toBeNull()
            }
        }
    })
})
