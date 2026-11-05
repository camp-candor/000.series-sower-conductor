import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
    canonicalizeJson,
    mintProvenanceManifest,
    computeFileSha256,
} from '../37.lifecycle.unit/buz/lockfileMinting.buzz.js'
import { emitWormSnapshots } from '../37.lifecycle.unit/buz/wormSnapshot.buzz.js'
import { dispatchSettlementReceipt } from '../37.lifecycle.unit/buz/settlementDispatch.buzz.js'

describe('packages/400.conductor Phase 9 Cryptographic Provenance Ledger Settlement', () => {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')
    const scratchDir = process.cwd().endsWith('400.conductor')
        ? 'val/scratch_provenance_test'
        : 'packages/400.conductor/val/scratch_provenance_test'
    const mockAssetPath = path.join(scratchDir, 'mock_plate.mp4')

    beforeEach(() => {
        if (!fs.existsSync(scratchDir)) {
            fs.mkdirSync(scratchDir, { recursive: true })
        }
        fs.writeFileSync(
            mockAssetPath,
            Buffer.from('mock video plate data payload'),
        )
    })

    afterEach(() => {
        if (fs.existsSync(scratchDir)) {
            fs.rmSync(scratchDir, { recursive: true, force: true })
        }
    })

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('canonicalizes JSON deterministically according to RFC 8785 JCS sorting', () => {
        const objA = { z: 1, a: 2, m: { y: 'test', b: 10 } }
        const objB = { a: 2, m: { b: 10, y: 'test' }, z: 1 }

        const canonA = canonicalizeJson(objA)
        const canonB = canonicalizeJson(objB)

        expect(canonA).toBe(canonB)
        expect(canonA).toBe('{"a":2,"m":{"b":10,"y":"test"},"z":1}')
    })

    it('mints UniversalProvenanceManifest with valid 40-char Git SHA and 64-char Merkle root', async () => {
        const manifest = await mintProvenanceManifest('ep01_sc01', 'ep01', [
            mockAssetPath,
        ])

        expect(manifest.sceneId).toBe('ep01_sc01')
        expect(manifest.gitCommitSha).toMatch(/^[a-f0-9]{40}$/)
        expect(manifest.canonMerkleRoot).toMatch(/^[a-f0-9]{64}$/)
        expect(manifest.lockfileSha256).toMatch(/^[a-f0-9]{64}$/)
        expect(manifest.assetDigests[mockAssetPath]).toBeDefined()
        expect(manifest.assetDigests[mockAssetPath]).toMatch(/^[a-f0-9]{64}$/)
    })

    it('fails closed when Git SHA or Canon Merkle root is malformed or truncated', async () => {
        await expect(
            mintProvenanceManifest('ep01_sc01', 'ep01', [], {
                gitCommitSha: 'short_sha',
            }),
        ).rejects.toThrowError(/INVALID_GIT_SHA/)

        await expect(
            mintProvenanceManifest('ep01_sc01', 'ep01', [], {
                canonMerkleRoot: '12345',
            }),
        ).rejects.toThrowError(/INVALID_CANON_ROOT/)
    })

    it('fails closed when an asset file is missing on disk', () => {
        const nonExistentPath = path.join(scratchDir, 'missing_file.mp4')
        expect(() => computeFileSha256(nonExistentPath)).toThrowError(
            /FILE_NOT_FOUND/,
        )
    })

    it('emits bit-identical dual WORM snapshots with Windows-safe ISO timestamps', async () => {
        const manifest = await mintProvenanceManifest('ep01_sc01', 'ep01', [
            mockAssetPath,
        ])
        const receipt = await emitWormSnapshots(
            'ep01_sc01',
            manifest,
            scratchDir,
        )

        expect(receipt.ok).toBe(true)
        expect(receipt.identical).toBe(true)
        expect(receipt.primarySha256).toBe(receipt.wormSha256)
        expect(receipt.wormSnapshotPath).not.toContain(':') // Windows-safe filename check
        expect(fs.existsSync(receipt.primarySnapshotPath)).toBe(true)
        expect(fs.existsSync(receipt.wormSnapshotPath)).toBe(true)
    })

    it('dispatches settlement receipt and acknowledges D1 is_dirty = 0 status', async () => {
        const manifest = await mintProvenanceManifest('ep01_sc01', 'ep01', [
            mockAssetPath,
        ])

        const mockFetch = async () =>
            new Response(
                JSON.stringify({
                    sceneId: 'ep01_sc01',
                    composition_status: 'SEALED',
                    is_dirty: 0,
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            )

        const receipt = await dispatchSettlementReceipt(manifest, {
            mockFetch: mockFetch as any,
        })

        expect(receipt.ok).toBe(true)
        expect(receipt.edgeAcknowledged).toBe(true)
        expect(receipt.isDirtyReset).toBe(true)
        expect(receipt.compositionStatus).toBe('SEALED')
        expect(receipt.t0Spend).toBe('$0.00')
    })

    it('asserts 100% pure 7-bit ASCII compliance across provenance settlement modules', () => {
        const files = [
            '37.lifecycle.unit/fce/provenance.interface.ts',
            '37.lifecycle.unit/buz/lockfileMinting.buzz.ts',
            '37.lifecycle.unit/buz/wormSnapshot.buzz.ts',
            '37.lifecycle.unit/buz/settlementDispatch.buzz.ts',
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
