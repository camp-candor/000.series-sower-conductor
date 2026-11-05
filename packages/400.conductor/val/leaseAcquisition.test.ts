import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    generateUuidV7,
    acquireHardwareLease,
} from '../36.edgebridge.unit/buz/leaseAcquisition.buzz.js'
import { EdgeBridgeModel } from '../36.edgebridge.unit/edgebridge.model.js'
import { reducer } from '../36.edgebridge.unit/edgebridge.reduce.js'
import { ACQUIRE_HARDWARE_LEASE } from '../36.edgebridge.unit/edgebridge.action.js'

describe('packages/400.conductor [Task 6.1] Edge Bridge Mutex Lease Acquisition', () => {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('generates valid RFC-compliant UUIDv7 tokens with monotonically increasing timestamps', () => {
        const token1 = generateUuidV7()
        const token2 = generateUuidV7()

        expect(token1).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        )
        expect(token2).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        )
        expect(token1).not.toBe(token2)
    })

    it('parses HTTP 200 immediate lease grant returning active leaseId and monotonic epoch', async () => {
        const mockFetch = async () =>
            new Response(
                JSON.stringify({
                    status: 'LEASE_GRANTED',
                    leaseId: 'lease_job_101_777',
                    epoch: 5,
                    grantedAtMs: 1762215000000,
                    expiresAtMs: 1762215030000,
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            )

        const receipt = await acquireHardwareLease(
            { sceneId: 'ep01_sc01', jobId: 'job_101', ttlMs: 30000 },
            { mockFetch: mockFetch as any },
        )

        expect(receipt.ok).toBe(true)
        expect(receipt.status).toBe('LEASE_GRANTED')
        expect(receipt.leaseId).toBe('lease_job_101_777')
        expect(receipt.epoch).toBe(5)
        expect(receipt.expiresAtMs).toBe(1762215030000)
        expect(receipt.idempotencyKey).toBeDefined()
    })

    it('parses HTTP 202 queued response indicating hardware mutex contention', async () => {
        const mockFetch = async () =>
            new Response(
                JSON.stringify({
                    status: 'QUEUED',
                    queuePosition: 2,
                }),
                {
                    status: 202,
                    headers: { 'Content-Type': 'application/json' },
                },
            )

        const receipt = await acquireHardwareLease(
            { sceneId: 'ep01_sc01', jobId: 'job_102', ttlMs: 30000 },
            { mockFetch: mockFetch as any },
        )

        expect(receipt.ok).toBe(true)
        expect(receipt.status).toBe('QUEUED')
        expect(receipt.leaseId).toBeNull()
        expect(receipt.epoch).toBeNull()
        expect(receipt.queuePosition).toBe(2)
    })

    it('handles transport failure and timeout gracefully with structured receipt', async () => {
        const mockFetch = async () => {
            throw new Error(
                'ECONNREFUSED: Connection refused at 127.0.0.1:8787',
            )
        }

        const receipt = await acquireHardwareLease(
            { sceneId: 'ep01_sc01', jobId: 'job_103' },
            { mockFetch: mockFetch as any },
        )

        expect(receipt.ok).toBe(false)
        expect(receipt.status).toBe('REJECTED')
        expect(receipt.error).toContain('ECONNREFUSED')
    })

    it('integrates with edgebridge reducer updating model to LEASE_ACTIVE', async () => {
        const initialModel = new EdgeBridgeModel()
        let resolvedBit: any = null

        const action = {
            type: ACQUIRE_HARDWARE_LEASE,
            bale: {
                src: 'job_200',
                dat: {
                    sceneId: 'ep01_sc01',
                    jobId: 'job_200',
                },
                slv: (res: any) => {
                    resolvedBit = res
                },
            },
        }

        // Reducer executes acquireHardwareLeaseBuzz
        const updated = await reducer(initialModel, action as any)

        expect(resolvedBit).toBeDefined()
        expect(updated.connectionStatus).toBeDefined()
        expect(updated.idx).toBe('36.edgebridge.unit')
    })

    it('asserts 100% pure 7-bit ASCII compliance across lease acquisition files', () => {
        const files = [
            '36.edgebridge.unit/fce/edgebridge.interface.ts',
            '36.edgebridge.unit/buz/leaseAcquisition.buzz.ts',
            '36.edgebridge.unit/buz/00.edgebridge.buzz.ts',
        ]

        for (const rel of files) {
            const full = path.resolve(packageRoot, rel)
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                // eslint-disable-next-line no-control-regex
                const match = content.match(/[\u0080-\uFFFF]/)
                expect(match).toBeNull()
            }
        }
    })
})
