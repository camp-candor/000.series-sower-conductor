import { describe, it, expect, vi } from 'vitest'
import { initConductor } from './buz/conductor.buzz.js'
import { ConductorModel } from './conductor.model.js'

describe('packages/400.conductor 00.conductor.unit Local Initialization', () => {
    it('instantiates ConductorModel with default index and offline status', () => {
        const model = new ConductorModel()
        expect(model.idx).toBe('00.conductor.unit')
        expect(model.status).toBe('OFFLINE')
        expect(model.totalScenesProcessed).toBe(0)
    })

    it('initializes conductor status to READY and triggers slv resolution', () => {
        const model = new ConductorModel()
        const state = {
            hunt: vi.fn().mockResolvedValue({}),
            dispatch: vi.fn(),
        } as any
        const slv = vi.fn()
        const bal = { idx: 'test-init', slv } as any

        const result = initConductor(model, bal, state)
        expect(result.status).toBe('READY')
        expect(slv).toHaveBeenCalledWith({
            conductorBit: {
                idx: 'init-conductor',
                val: 1,
            },
        })
    })
})
