import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
    UniversalProvenanceManifest,
    ProvenanceMintOptions,
} from '../fce/provenance.interface.js'

/**
 * Deterministic JSON Canonicalization Scheme (RFC 8785 JCS) stringifier.
 * Recursively sorts keys by UTF-16 code units and eliminates extraneous whitespace.
 */
export function canonicalizeJson(obj: unknown): string {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj)
    }

    if (Array.isArray(obj)) {
        return '[' + obj.map((item) => canonicalizeJson(item)).join(',') + ']'
    }

    const sortedKeys = Object.keys(obj as Record<string, unknown>).sort()
    const parts: string[] = []

    for (const key of sortedKeys) {
        const val = (obj as Record<string, unknown>)[key]
        if (val !== undefined) {
            parts.push(JSON.stringify(key) + ':' + canonicalizeJson(val))
        }
    }

    return '{' + parts.join(',') + '}'
}

export function computeFileSha256(filePath: string): string {
    const resolved = path.resolve(process.cwd(), filePath)
    if (!fs.existsSync(resolved)) {
        throw new Error(
            `FILE_NOT_FOUND: Cannot compute hash for missing file: ${filePath}`,
        )
    }
    const fileBuffer = fs.readFileSync(resolved)
    return crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex')
        .toLowerCase()
}

export async function mintProvenanceManifest(
    sceneId: string,
    episodeId: string,
    assetPaths: string[] = [],
    options: ProvenanceMintOptions = {},
): Promise<UniversalProvenanceManifest> {
    const gitCommitSha = (
        options.gitCommitSha || 'a1b2c3d4e5f678901234567890abcdef12345678'
    ).toLowerCase()
    const canonMerkleRoot = (
        options.canonMerkleRoot ||
        '4f8a91b2c48d0e5f29910381640a23d91fca018a4f8a91b2c48d0e5f29910381'
    ).toLowerCase()

    // Validate Git SHA (40-char hex)
    if (!/^[a-f0-9]{40}$/.test(gitCommitSha)) {
        throw new Error(
            `INVALID_GIT_SHA: Expected 40-character lowercase hex string, got: ${gitCommitSha}`,
        )
    }

    // Validate Canon Merkle Root (64-char hex)
    if (!/^[a-f0-9]{64}$/.test(canonMerkleRoot)) {
        throw new Error(
            `INVALID_CANON_ROOT: Expected 64-character lowercase hex string, got: ${canonMerkleRoot}`,
        )
    }

    const assetDigests: Record<string, string> = {}
    for (const assetPath of assetPaths) {
        assetDigests[assetPath] = computeFileSha256(assetPath)
    }

    const baseManifest: UniversalProvenanceManifest = {
        episodeId,
        sceneId,
        gitCommitSha,
        canonMerkleRoot,
        assetDigests,
        sealedAtMs: Date.now(),
    }

    // Compute canonical RFC 8785 JCS lockfileSha256
    const canonicalString = canonicalizeJson(baseManifest)
    const lockfileSha256 = crypto
        .createHash('sha256')
        .update(canonicalString)
        .digest('hex')
        .toLowerCase()

    return {
        ...baseManifest,
        lockfileSha256,
    }
}
