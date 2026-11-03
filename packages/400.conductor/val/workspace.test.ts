import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sim from '../hunt.js'
import UnitData from '../BEE.js'
import * as ActCnd from '../00.conductor.unit/conductor.action.js'

describe('packages/400.conductor Workspace Architecture', () => {
    it('strictly contains zero src/ directory', () => {
        const srcPath = path.resolve(
            process.cwd(),
            'packages/400.conductor/src',
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
        expect(res.conductorBit.dat.status).toBe('READY')
    })
})
