import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sim from '../hunt.js'
import UnitData from '../BEE.js'
import * as ActCnd from '../00.conductor.unit/conductor.action.js'

describe('packages/400.conductor Workspace Architecture', () => {
    it('strictly contains zero src/ directory', () => {
        // Resolve from this file's location so the check is meaningful
        // whether vitest runs from the monorepo root or the package dir.
        const srcPath = path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            '..',
            'src',
        )
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('initializes UnitData with 400.conductor index', () => {
        const data = new UnitData()
        expect(data.idx).toBe('400.conductor')
    })

    it('dispatches InitConductor via sim.hunt and receives status receipt', async () => {
        const res = await sim.hunt!(ActCnd.INIT_CONDUCTOR, {})
        expect(res).toBeDefined()
        expect(res.conductorBit.val).toBe(1)
        // Feature 1.1 contract: init receipt is { idx, val }; READY status
        // is asserted on the returned model in conductor.test.ts.
        expect(res.conductorBit.idx).toBe('init-conductor')
    })
})
