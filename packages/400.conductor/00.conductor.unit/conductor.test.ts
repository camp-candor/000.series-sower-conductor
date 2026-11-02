import { describe, it, expect, vi } from 'vitest'
import { initConductor } from './buz/conductor.buzz.js'
import { ConductorModel } from './conductor.model.js'

describe('conductor', () => {
    it('should initialize conductor', () => {
        const model = new ConductorModel()
        const state = {
            hunt: vi.fn().mockResolvedValue({}),
            dispatch: vi.fn(),
        } as any

        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        // Check if initConductor is a function and can be called
        expect(typeof initConductor).toBe('function')

        const result = initConductor(model, bal, state)
        expect(result).toBe(model)
        //expect(slv).toHaveBeenCalledWith({ intBit: { idx: 'init-conductor' } });
    })

    it('should wake up the conductor if url is provided', async () => {
        const model = new ConductorModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urlconductor =
            'https://zero00-conductor.onrender.com/api/conductor/test'

        const mockResponseconductor = { status: 'conductor-awake' }

        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urlconductor) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockResponseconductor),
                    } as any)
                }
                return Promise.reject(new Error('Unknown URL'))
            })

        initConductor(model, bal, state)

        // Wait for the promise in initConductor to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urlconductor)
        expect(slv).toHaveBeenCalledWith({
            intBit: {
                idx: 'init-conductor',
                dat: {
                    conductor: mockResponseconductor,
                },
            },
        })

        globalFetch.mockRestore()
    })

    it('should handle fetch errors', async () => {
        const model = new ConductorModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urlconductor =
            'https://zero00-conductor.onrender.com/api/conductor/test'

        const errorMessage = 'Network error'
        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urlconductor) {
                    return Promise.reject(new Error(errorMessage))
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({}),
                } as any)
            })

        initConductor(model, bal, state)

        // Wait for the promise in initConductor to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urlconductor)

        expect(slv).toHaveBeenCalledWith({
            intBit: { idx: 'init-conductor-err', dat: errorMessage },
        })

        globalFetch.mockRestore()
    })
})
