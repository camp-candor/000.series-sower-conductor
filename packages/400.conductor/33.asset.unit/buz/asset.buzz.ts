import { execSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { AssetModel } from '../asset.model.js'
import AssetBit from '../fce/asset.bit.js'
import { AssetManifest, PinnedTrees } from '../fce/asset.interface.js'
import State from '../../99.core/state.js'

export const EMPTY_FILE_SHA256 =
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

export const resolveLiveTreeSha = (subPath: string): string => {
    try {
        return execSync(`git rev-parse HEAD:${subPath}`, {
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString('ascii')
            .trim()
    } catch (_e) {
        throw new Error(
            `GIT_TREE_RESOLVE_FAILED: Path does not exist in HEAD tree: ${subPath}`,
        )
    }
}

export const auditDirectoryForCorruptAssets = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) return
    const entries = fs.readdirSync(dirPath, { recursive: true }) as string[]

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry)
        const stat = fs.statSync(fullPath)
        if (!stat.isFile()) continue

        if (stat.size === 0) {
            throw new Error(`ZERO_BYTE_POISON: ${entry}`)
        }

        const buf = fs.readFileSync(fullPath)
        const hash = crypto.createHash('sha256').update(buf).digest('hex')
        if (hash === EMPTY_FILE_SHA256) {
            throw new Error(
                `ZERO_BYTE_POISON: Empty buffer constant matched on ${entry}`,
            )
        }

        if (
            entry.endsWith('.glb') ||
            entry.endsWith('.gltf') ||
            entry.endsWith('.bin')
        ) {
            const header = buf.subarray(0, 7).toString('ascii')
            if (header === 'version' || stat.size < 1024) {
                throw new Error(`LFS_POINTER_UNHYDRATED: ${entry}`)
            }
        }
    }
}

export const initAsset = (cpy: AssetModel, bal: AssetBit, _ste: State) => {
    if (bal.slv) bal.slv({ assetBit: { idx: 'init-asset', val: 1 } })
    return cpy
}

export const verifyAssetTreeParity = (
    cpy: AssetModel,
    bal: AssetBit,
    _ste: State,
) => {
    const cns = '>> [PROVENANCE]'
    const seriesSlug = bal.src || cpy.seriesSlug || 'wiregrass-basin'
    const manifestPath = path.resolve(
        process.cwd(),
        `assets/${seriesSlug}/manifest.json`,
    )

    if (!fs.existsSync(manifestPath)) {
        const errMsg = `ASSET_MANIFEST_MISSING: Cannot verify provenance at ${manifestPath}`
        process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'verify-asset-parity-error',
                    val: 0,
                    src: errMsg,
                },
            })
        throw new Error(errMsg)
    }

    const rawManifest = fs.readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(rawManifest) as AssetManifest

    // 1. Scan asset directories for zero-byte poison or unhydrated LFS text pointers
    const assetsBasePath = path.resolve(process.cwd(), `assets/${seriesSlug}`)
    try {
        auditDirectoryForCorruptAssets(assetsBasePath)
    } catch (err: any) {
        process.stderr.write(
            `${cns} [FAIL] Integrity defect detected: ${err.message}\n`,
        )
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'verify-asset-parity-error',
                    val: 0,
                    src: err.message,
                },
            })
        throw err
    }

    // 2. Resolve live Git tree SHAs
    let liveTrees: PinnedTrees
    try {
        if (bal.dat?.mockLiveTrees) {
            liveTrees = bal.dat.mockLiveTrees
        } else {
            liveTrees = {
                characters_tree_sha: resolveLiveTreeSha(
                    `assets/${seriesSlug}/characters`,
                ),
                environments_tree_sha: resolveLiveTreeSha(
                    `assets/${seriesSlug}/environments`,
                ),
                props_tree_sha: resolveLiveTreeSha(
                    `assets/${seriesSlug}/props`,
                ),
            }
        }
    } catch (err: any) {
        process.stderr.write(`${cns} [FAIL] ${err.message}\n`)
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'verify-asset-parity-error',
                    val: 0,
                    src: err.message,
                },
            })
        throw err
    }

    // 3. Parity comparisons against manifest
    if (
        liveTrees.characters_tree_sha !==
        manifest.pinned_trees.characters_tree_sha
    ) {
        const errMsg = `CANON_STALE: Characters tree mismatch. Pinned: ${manifest.pinned_trees.characters_tree_sha} | Live: ${liveTrees.characters_tree_sha}`
        process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'verify-asset-parity-error',
                    val: 0,
                    src: errMsg,
                },
            })
        throw new Error(errMsg)
    }

    if (
        liveTrees.environments_tree_sha !==
        manifest.pinned_trees.environments_tree_sha
    ) {
        const errMsg = `CANON_STALE: Environments tree mismatch. Pinned: ${manifest.pinned_trees.environments_tree_sha} | Live: ${liveTrees.environments_tree_sha}`
        process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'verify-asset-parity-error',
                    val: 0,
                    src: errMsg,
                },
            })
        throw new Error(errMsg)
    }

    if (liveTrees.props_tree_sha !== manifest.pinned_trees.props_tree_sha) {
        const errMsg = `CANON_STALE: Props tree mismatch. Pinned: ${manifest.pinned_trees.props_tree_sha} | Live: ${liveTrees.props_tree_sha}`
        process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'verify-asset-parity-error',
                    val: 0,
                    src: errMsg,
                },
            })
        throw new Error(errMsg)
    }

    cpy.seriesSlug = seriesSlug
    cpy.manifestVersion = manifest.manifest_version
    cpy.isParityVerified = true
    cpy.liveTrees = liveTrees

    process.stdout.write(
        `${cns} [OK] 3D Asset tree parity verified across characters, environments, and props.\n`,
    )

    if (bal.slv) {
        bal.slv({
            assetBit: {
                idx: 'verify-asset-parity',
                val: 1,
                src: seriesSlug,
                dat: liveTrees,
            },
        })
    }
    return cpy
}
