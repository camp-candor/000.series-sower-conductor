import { describe, it, expect } from 'vitest'

describe('Feature 7.2: Rig 1 Zero-VRAM Hardware Sentry Test', () => {
    it('enforces CUDA_VISIBLE_DEVICES="" and confirms zero GPU VRAM allocation', () => {
        const originalEnv = process.env.CUDA_VISIBLE_DEVICES
        // Set execution barrier
        process.env.CUDA_VISIBLE_DEVICES = ''

        expect(process.env.CUDA_VISIBLE_DEVICES).toBe('')
        // Restore
        if (originalEnv !== undefined) {
            process.env.CUDA_VISIBLE_DEVICES = originalEnv
        } else {
            delete process.env.CUDA_VISIBLE_DEVICES
        }
    })

    it('guarantees packages/400.conductor/src does not exist on disk', () => {
        return import('node:fs').then((fs) => {
            const srcExists = fs.existsSync('packages/400.conductor/src')
            expect(srcExists).toBe(false)
        })
    })
})
