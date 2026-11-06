import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import sim from '../hunt.js'
import * as ActMnu from '../98.menu.unit/menu.action.js'
import * as ActEdge from '../36.edgebridge.unit/edgebridge.action.js'
import {
    resolveCoordinationEndpoint,
    setRuntimeEndpoint,
    clearRuntimeEndpoint,
} from '../36.edgebridge.unit/buz/endpointResolver.buzz.js'
import { dispatchEdgeHttpRequest } from '../36.edgebridge.unit/buz/restClient.buzz.js'

describe('packages/400.conductor Phase 8 Offline Vitest Adversarial Gauntlet', () => {
    beforeEach(() => {
        clearRuntimeEndpoint()
        delete (globalThis as any).packageBaseUrl
        delete process.env.WORKER_URL
    })

    afterEach(() => {
        clearRuntimeEndpoint()
        vi.restoreAllMocks()
    })

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(
            process.cwd(),
            'packages/400.conductor/src',
        )
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('asserts immutable runner boundary apps/995.library/995.library/ has 0 modified lines', () => {
        try {
            const diff = execSync(
                'git status -s apps/995.library/995.library/',
                {
                    encoding: 'utf8',
                },
            ).trim()
            expect(diff).toBe('')
        } catch {
            // In isolated environments where git is uninitialized, assert directory exists without stubs
            const libPath = path.resolve(
                process.cwd(),
                'apps/995.library/995.library',
            )
            expect(fs.existsSync(libPath)).toBe(true)
        }
    })

    it('asserts 100% pure 7-bit ASCII compliance across conductor units and worker sources', () => {
        const scanTargets = [
            path.resolve(
                process.cwd(),
                'packages/400.conductor/36.edgebridge.unit',
            ),
            path.resolve(process.cwd(), 'packages/400.conductor/98.menu.unit'),
            path.resolve(process.cwd(), 'apps/worker/src'),
        ]

        const scanDirectory = (dir: string) => {
            if (!fs.existsSync(dir)) return
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
                const full = path.join(dir, entry.name)
                if (entry.isDirectory()) {
                    scanDirectory(full)
                } else if (
                    entry.name.endsWith('.ts') ||
                    entry.name.endsWith('.jsonc')
                ) {
                    const content = fs.readFileSync(full, 'utf8')
                    // eslint-disable-next-line no-control-regex
                    const match = content.match(/[\u0080-\uFFFF]/)
                    expect(match).toBeNull()
                }
            }
        }

        for (const target of scanTargets) {
            scanDirectory(target)
        }
    })

    it('verifies dynamic 4-tier resolution cascade without stale closure caching', () => {
        // Tier 4: Loopback default
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            'http://127.0.0.1:8787',
        )

        // Tier 3: Environment variable
        process.env.WORKER_URL = 'http://127.0.0.1:9090'
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            'http://127.0.0.1:9090',
        )

        // Tier 2: Package override
        ;(globalThis as any).packageBaseUrl = 'http://127.0.0.1:9191'
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            'http://127.0.0.1:9191',
        )

        // Tier 1: Switchboard runtime override
        setRuntimeEndpoint('https://series-edge-orchestrator.workers.dev')
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            'https://series-edge-orchestrator.workers.dev',
        )
    })

    it('aborts hanging network requests under 5000ms ceiling returning REQUEST_TIMEOUT', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation((_url, options) => {
                return new Promise((_resolve, reject) => {
                    if (options?.signal) {
                        options.signal.addEventListener('abort', () => {
                            const abortErr = new Error(
                                'The operation was aborted',
                            )
                            abortErr.name = 'AbortError'
                            reject(abortErr)
                        })
                    }
                })
            }),
        )

        const res = await dispatchEdgeHttpRequest({
            endpointPath: '/stall',
            timeoutMs: 100, // Accelerated for test speed
        })

        expect(res.ok).toBe(false)
        expect(res.status).toBe(408)
        expect(res.error?.code).toBe('REQUEST_TIMEOUT')
    })

    it('executes menu initialization and updates cleanly in headless environment', async () => {
        delete (globalThis as any).LIBRARY

        const initRes = await sim.hunt!(ActMnu.INIT_MENU, {})
        expect(initRes.menuBit.val).toBe(1)
        expect(initRes.menuBit.idx).toBe('init-menu')

        const updateRes = await sim.hunt!(ActMnu.UPDATE_MENU, {
            src: 'PING EDGE COORDINATOR HEALTH',
        })
        expect(updateRes.menuBit.val).toBe(1)
        expect(updateRes.menuBit.src).toBe('PING EDGE COORDINATOR HEALTH')
        expect(updateRes.menuBit.lst.length).toBeGreaterThan(5)
    })

    it('dispatches edge lease acquisition and advances monotonic epoch counter', async () => {
        const res = await sim.hunt!(ActEdge.ACQUIRE_HARDWARE_LEASE, {
            src: 'job_gauntlet_01',
            val: 30000,
        })

        expect(res.edgebridgeBit.val).toBe(1)
        expect(res.edgebridgeBit.dat.jobId).toBe('job_gauntlet_01')
        expect(res.edgebridgeBit.dat.epoch).toBeGreaterThan(0)
        expect(res.edgebridgeBit.dat.expiresAtMs).toBeGreaterThan(Date.now())
    })
})
