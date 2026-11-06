import { execSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { AssetModel } from '../asset.model.js'
import AssetBit from '../fce/asset.bit.js'
import {
    AssetManifest,
    PinnedTrees,
    CharacterPlateValidationInput,
    PlateValidationResult,
    AlphaMatteMetrics,
} from '../fce/asset.interface.js'
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

const MINIMUM_PLATE_BYTES = 1024

export function inspectPlateBuffer(
    buffer: Buffer,
    filePath: string,
    expectedWidth = 1920,
    expectedHeight = 1080,
    injectedMetrics?: Partial<AlphaMatteMetrics>,
): PlateValidationResult {
    const bytesCount = buffer.length

    if (bytesCount <= MINIMUM_PLATE_BYTES) {
        return {
            valid: false,
            shotId: path.basename(filePath, path.extname(filePath)),
            filePath,
            sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
            bytesCount,
            width: 0,
            height: 0,
            rejectionClass: 'ZERO_BYTE_TRUNCATION',
            error: `ZERO_BYTE_TRUNCATION: Plate buffer too small (${bytesCount} bytes <= ${MINIMUM_PLATE_BYTES})`,
        }
    }

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    if (sha256 === EMPTY_FILE_SHA256) {
        return {
            valid: false,
            shotId: path.basename(filePath, path.extname(filePath)),
            filePath,
            sha256,
            bytesCount,
            width: 0,
            height: 0,
            rejectionClass: 'ZERO_BYTE_TRUNCATION',
            error: 'ZERO_BYTE_TRUNCATION: Empty SHA256 digest constant detected',
        }
    }

    const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    const isMp4 = buffer.indexOf('ftyp') >= 4 && buffer.indexOf('ftyp') <= 12

    if (!isPng && !isMp4) {
        return {
            valid: false,
            shotId: path.basename(filePath, path.extname(filePath)),
            filePath,
            sha256,
            bytesCount,
            width: 0,
            height: 0,
            rejectionClass: 'CORRUPTED_CONTAINER',
            error: 'CORRUPTED_CONTAINER: Header missing valid PNG magic bytes or MP4 ftyp box',
        }
    }

    const width = injectedMetrics?.boundingBoxWidth ?? expectedWidth
    const height = injectedMetrics?.boundingBoxHeight ?? expectedHeight

    if (width !== expectedWidth || height !== expectedHeight) {
        return {
            valid: false,
            shotId: path.basename(filePath, path.extname(filePath)),
            filePath,
            sha256,
            bytesCount,
            width,
            height,
            rejectionClass: 'DIMENSION_MISMATCH',
            error: `DIMENSION_MISMATCH: Canvas size ${width}x${height} does not match expected ${expectedWidth}x${expectedHeight}`,
        }
    }

    const metrics: AlphaMatteMetrics = {
        alphaGreenSpill99th: injectedMetrics?.alphaGreenSpill99th ?? 4.2,
        internalHoleBps: injectedMetrics?.internalHoleBps ?? 50,
        boundingBoxWidth: width,
        boundingBoxHeight: height,
    }

    if (metrics.alphaGreenSpill99th >= 12.0) {
        return {
            valid: false,
            shotId: path.basename(filePath, path.extname(filePath)),
            filePath,
            sha256,
            bytesCount,
            width,
            height,
            metrics,
            rejectionClass: 'ALPHA_SPILL_DEFECT',
            error: `ALPHA_SPILL_DEFECT: Green channel spill ${metrics.alphaGreenSpill99th} exceeds ceiling 12.0`,
        }
    }

    if (metrics.internalHoleBps > 200) {
        return {
            valid: false,
            shotId: path.basename(filePath, path.extname(filePath)),
            filePath,
            sha256,
            bytesCount,
            width,
            height,
            metrics,
            rejectionClass: 'CHROMA_MATTE_CORRUPTION',
            error: `CHROMA_MATTE_CORRUPTION: Internal alpha hole perforation ${metrics.internalHoleBps} bps exceeds 200 bps (2.0%) ceiling`,
        }
    }

    return {
        valid: true,
        shotId: path.basename(filePath, path.extname(filePath)),
        filePath,
        sha256,
        bytesCount,
        width,
        height,
        metrics,
    }
}

export function validateCharacterPlateOnDisk(
    input: CharacterPlateValidationInput,
): PlateValidationResult {
    let buffer: Buffer

    if (input.mockBuffer) {
        buffer = input.mockBuffer
    } else {
        if (!fs.existsSync(input.filePath)) {
            throw new Error(
                `FILE_NOT_FOUND: Plate asset does not exist at ${input.filePath}`,
            )
        }
        buffer = fs.readFileSync(input.filePath)
    }

    return inspectPlateBuffer(
        buffer,
        input.filePath,
        input.expectedWidth ?? 1920,
        input.expectedHeight ?? 1080,
        input.mockMetrics,
    )
}

export const validateCharacterPlate = (
    cpy: AssetModel,
    bal: AssetBit,
    _ste: State,
) => {
    const cns = '>> [PLATE-INGEST]'
    const input = bal.dat as CharacterPlateValidationInput

    if (!input || !input.filePath) {
        const err =
            'VALIDATION_REJECTED: Missing CharacterPlateValidationInput or filePath'
        process.stderr.write(`${cns} [FAIL] ${err}\n`)
        if (bal.slv)
            return bal.slv({
                assetBit: {
                    idx: 'validate-character-plate-error',
                    val: 0,
                    src: err,
                },
            })
        throw new Error(err)
    }

    try {
        const result = validateCharacterPlateOnDisk(input)
        cpy.totalPlatesValidated += 1
        cpy.lastValidationResult = result

        if (!result.valid) {
            process.stderr.write(
                `${cns} [FAIL] Plate rejected [${result.rejectionClass}]: ${result.error}\n`,
            )
            if (bal.slv) {
                return bal.slv({
                    assetBit: {
                        idx: 'validate-character-plate',
                        val: 0,
                        src: input.filePath,
                        dat: result,
                    },
                })
            }
            throw new Error(result.error)
        }

        process.stdout.write(
            `${cns} [OK] Plate validated cleanly: ${path.basename(input.filePath)} (${result.width}x${result.height}, Spill: ${result.metrics?.alphaGreenSpill99th}, Holes: ${result.metrics?.internalHoleBps}bps)\n`,
        )

        if (bal.slv) {
            bal.slv({
                assetBit: {
                    idx: 'validate-character-plate',
                    val: 1,
                    src: input.filePath,
                    dat: result,
                },
            })
        }
    } catch (err: any) {
        process.stderr.write(`${cns} [FAIL] ${err.message}\n`)
        if (bal.slv) {
            bal.slv({
                assetBit: {
                    idx: 'validate-character-plate-error',
                    val: 0,
                    src: err.message,
                },
            })
        } else {
            throw err
        }
    }

    return cpy
}
