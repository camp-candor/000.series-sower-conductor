import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sim from '../hunt.js'
import * as ActAsset from '../33.asset.unit/asset.action.js'
import { auditDirectoryForCorruptAssets } from '../33.asset.unit/buz/asset.buzz.js'
import { AssetManifest } from '../33.asset.unit/fce/asset.interface.js'

describe('packages/400.conductor 33.asset.unit 3D Asset Tree Parity Verifier', () => {
    const testSeriesSlug = 'test-asset-series'
    const assetDir = path.resolve(process.cwd(), `assets/${testSeriesSlug}`)
    const manifestPath = path.resolve(assetDir, 'manifest.json')

    const sampleManifest: AssetManifest = {
        manifest_version: '1.0.0',
        series_slug: testSeriesSlug,
        pinned_trees: {
            characters_tree_sha: '1111111111111111111111111111111111111111',
            environments_tree_sha: '2222222222222222222222222222222222222222',
            props_tree_sha: '3333333333333333333333333333333333333333',
        },
    }

    beforeEach(() => {
        if (!fs.existsSync(assetDir)) {
            fs.mkdirSync(assetDir, { recursive: true })
        }
        fs.writeFileSync(manifestPath, JSON.stringify(sampleManifest, null, 2))
    })

    afterEach(() => {
        if (fs.existsSync(manifestPath)) fs.unlinkSync(manifestPath)
        if (fs.existsSync(assetDir)) fs.rmdirSync(assetDir, { recursive: true })
    })

    it('verifies parity when live tree SHAs match pinned manifest trees', async () => {
        const mockLiveTrees = {
            characters_tree_sha: '1111111111111111111111111111111111111111',
            environments_tree_sha: '2222222222222222222222222222222222222222',
            props_tree_sha: '3333333333333333333333333333333333333333',
        }

        const res = await sim.hunt!(ActAsset.VERIFY_ASSET_PARITY, {
            src: testSeriesSlug,
            dat: { mockLiveTrees },
        })

        expect(res).toBeDefined()
        expect(res.assetBit.val).toBe(1)
        expect(res.assetBit.src).toBe(testSeriesSlug)
        expect(res.assetBit.dat.characters_tree_sha).toBe(
            sampleManifest.pinned_trees.characters_tree_sha,
        )
    })

    it('negative control: rejects divergence on character tree hash with CANON_STALE', async () => {
        const divergentLiveTrees = {
            characters_tree_sha: '9999999999999999999999999999999999999999',
            environments_tree_sha: '2222222222222222222222222222222222222222',
            props_tree_sha: '3333333333333333333333333333333333333333',
        }

        const res = await sim.hunt!(ActAsset.VERIFY_ASSET_PARITY, {
            src: testSeriesSlug,
            dat: { mockLiveTrees: divergentLiveTrees },
        })

        expect(res.assetBit.val).toBe(0)
        expect(res.assetBit.src).toContain('CANON_STALE')
        expect(res.assetBit.src).toContain('Characters tree mismatch')
    })

    it('negative control: rejects divergence on environments tree hash with CANON_STALE', async () => {
        const divergentLiveTrees = {
            characters_tree_sha: '1111111111111111111111111111111111111111',
            environments_tree_sha: '8888888888888888888888888888888888888888',
            props_tree_sha: '3333333333333333333333333333333333333333',
        }

        const res = await sim.hunt!(ActAsset.VERIFY_ASSET_PARITY, {
            src: testSeriesSlug,
            dat: { mockLiveTrees: divergentLiveTrees },
        })

        expect(res.assetBit.val).toBe(0)
        expect(res.assetBit.src).toContain('CANON_STALE')
        expect(res.assetBit.src).toContain('Environments tree mismatch')
    })

    it('negative control: trips on missing manifest.json with ASSET_MANIFEST_MISSING', async () => {
        fs.unlinkSync(manifestPath)

        const res = await sim.hunt!(ActAsset.VERIFY_ASSET_PARITY, {
            src: testSeriesSlug,
        })

        expect(res.assetBit.val).toBe(0)
        expect(res.assetBit.src).toContain('ASSET_MANIFEST_MISSING')
    })

    it('negative control: traps zero-byte truncated asset files', () => {
        const corruptFile = path.resolve(assetDir, 'broken.glb')
        fs.writeFileSync(corruptFile, Buffer.alloc(0))

        expect(() => {
            auditDirectoryForCorruptAssets(assetDir)
        }).toThrow('ZERO_BYTE_POISON')

        fs.unlinkSync(corruptFile)
    })

    it('negative control: traps unhydrated Git LFS text pointers', () => {
        const lfsPointerFile = path.resolve(assetDir, 'pointer.glb')
        const pointerContent =
            'version https://git-lfs.github.com/spec/v1\noid sha256:1111111111111111111111111111111111111111111111111111111111111111\nsize 123456\n'
        fs.writeFileSync(lfsPointerFile, pointerContent)

        expect(() => {
            auditDirectoryForCorruptAssets(assetDir)
        }).toThrow('LFS_POINTER_UNHYDRATED')

        fs.unlinkSync(lfsPointerFile)
    })
})
