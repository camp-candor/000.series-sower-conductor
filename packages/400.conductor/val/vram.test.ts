import { describe, it, expect } from 'vitest'
import sim from '../hunt.js'
import * as ActVram from '../26.vram.unit/vram.action.js'
import { pollVramHygieneGate } from '../26.vram.unit/buz/vram.buzz.js'

describe('packages/400.conductor 26.vram.unit Pre-Synthesis VRAM Hygiene Trigger', () => {
    it('verifies clean VRAM when memory immediately satisfies baseline envelope', async () => {
        const mockSampler = () => ({
            freeMb: 21500,
            totalMb: 24576,
            usedMb: 3076,
        })

        const res = await sim.hunt!(ActVram.EXECUTE_VRAM_HYGIENE, {
            src: 'http://127.0.0.1:8188',
            dat: {
                bypassNetworkCheck: true,
                baselineFreeMb: 21000,
                toleranceMb: 500,
                sampleFn: mockSampler,
            },
        })

        expect(res).toBeDefined()
        expect(res.vramBit.val).toBe(1)
        expect(res.vramBit.dat.verified).toBe(true)
        expect(res.vramBit.dat.finalFreeMb).toBe(21500)
    })

    it('handles asynchronous /free unmapping delay and passes once memory recovers', async () => {
        let callCount = 0
        const asyncRecoveringSampler = () => {
            callCount++
            // First 2 polls memory is still unmapping across PCIe (under target 20,500 MB)
            if (callCount < 3) {
                return { freeMb: 18000, totalMb: 24576, usedMb: 6576 }
            }
            return { freeMb: 21000, totalMb: 24576, usedMb: 3576 }
        }

        const result = await pollVramHygieneGate(
            21000,
            500,
            5000,
            asyncRecoveringSampler,
        )
        expect(result.finalFreeMb).toBe(21000)
        expect(callCount).toBeGreaterThanOrEqual(3)
    })

    it('negative control: trips circuit breaker when memory fails to return to baseline', async () => {
        const lockedContextSampler = () => ({
            freeMb: 12000,
            totalMb: 24576,
            usedMb: 12576,
        })

        const res = await sim.hunt!(ActVram.EXECUTE_VRAM_HYGIENE, {
            src: 'http://127.0.0.1:8188',
            dat: {
                bypassNetworkCheck: true,
                baselineFreeMb: 21000,
                toleranceMb: 500,
                timeoutMs: 600, // Short timeout for test
                sampleFn: lockedContextSampler,
            },
        })

        expect(res.vramBit.val).toBe(0)
        expect(res.vramBit.src).toContain('VRAM_HYGIENE_TIMEOUT')
        expect(res.vramBit.dat.verified).toBe(false)
    })

    it('negative control: fails closed when endpoint is unreachable and network check active', async () => {
        const res = await sim.hunt!(ActVram.EXECUTE_VRAM_HYGIENE, {
            src: 'http://127.0.0.1:9999', // Dead port
            dat: {
                bypassNetworkCheck: false,
            },
        })

        expect(res.vramBit.val).toBe(0)
        expect(res.vramBit.src).toContain('VRAM_ENDPOINT_UNREACHABLE')
    })
})
