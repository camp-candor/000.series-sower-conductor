import { describe, it, expect, beforeEach } from 'vitest'
import { ShotCoordinatorDO } from '../../src/objects/ShotCoordinatorDO.js'

describe('Feature 7.3: Cloudflare Edge Worker ShotCoordinatorDO Lease & Epoch Fence', () => {
    let coordinator: ShotCoordinatorDO
    let mockStorage: Map<string, any>

    beforeEach(() => {
        mockStorage = new Map()
        const mockState: any = {
            storage: {
                put: async (key: string, val: any) => mockStorage.set(key, val),
                get: async (key: string) => mockStorage.get(key),
            },
        }
        coordinator = new ShotCoordinatorDO(mockState)
    })

    it('acquires lease and advances monotonic epoch', async () => {
        const req = new Request('http://edge.internal/lease/acquire', {
            method: 'POST',
            body: JSON.stringify({ sceneId: 'ep01_sc01', ttlMs: 30000 }),
        })

        const res = await coordinator.fetch(req)
        expect(res.status).toBe(200)

        const data: any = await res.json()
        expect(data.epoch).toBe(2)
        expect(data.sceneId).toBe('ep01_sc01')
        expect(data.leaseId).toBeDefined()
    })

    it('rejects stale epoch tokens with HTTP 409 Conflict', async () => {
        // Advance epoch to 2
        await coordinator.fetch(
            new Request('http://edge.internal/lease/acquire', {
                method: 'POST',
                body: JSON.stringify({ sceneId: 'ep01_sc01' }),
            }),
        )

        // Present stale epoch 1
        const staleReq = new Request('http://edge.internal/lease/acquire', {
            method: 'POST',
            body: JSON.stringify({ sceneId: 'ep01_sc01', presentedEpoch: 1 }),
        })

        const res = await coordinator.fetch(staleReq)
        expect(res.status).toBe(409)
        const data: any = await res.json()
        expect(data.error).toContain('HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH')
    })
})
