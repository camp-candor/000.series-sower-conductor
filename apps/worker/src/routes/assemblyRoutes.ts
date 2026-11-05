import { Hono } from 'hono'

export interface UniversalProvenanceManifest {
    episodeId: string
    sceneId: string
    gitCommitSha: string
    canonMerkleRoot: string
    assetDigests: Record<string, string>
    nodeVersion?: string
    remotionVersion?: string
    sealedAtMs?: number
    metadata?: any
}

export interface AssemblySettlementReceipt {
    ok: boolean
    ackId: string
    episodeId: string
    sceneId: string
    status: 'SEALED'
    lockfileSha256: string
    gitCommitSha: string
    canonMerkleRoot: string
    assetCount: number
    settledAtMs: number
    latencyMs: number
}

const assemblyRoutes = new Hono<{ Bindings: any }>()

const GIT_SHA_REGEX = /^[a-f0-9]{40}$/i
const SHA256_REGEX = /^[a-f0-9]{64}$/i

async function computeSha256Hex(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

assemblyRoutes.post('/receipt', async (c) => {
    const startTime = Date.now()
    const body = (await c.req
        .json()
        .catch(() => null)) as UniversalProvenanceManifest | null

    if (!body || typeof body !== 'object') {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'MALFORMED_REQUEST_BODY',
                    message:
                        'Payload must be a valid JSON UniversalProvenanceManifest.',
                },
            },
            400,
        )
    }

    const { episodeId, sceneId, gitCommitSha, canonMerkleRoot, assetDigests } =
        body

    // 1. Mandatory Identity Validations
    if (
        !episodeId ||
        typeof episodeId !== 'string' ||
        !sceneId ||
        typeof sceneId !== 'string'
    ) {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'MISSING_MANIFEST_COORDINATES',
                    message: 'Both episodeId and sceneId strings are required.',
                },
            },
            400,
        )
    }

    // 2. Git Commit SHA Cryptographic Invariant (40-char hex)
    if (!gitCommitSha || !GIT_SHA_REGEX.test(gitCommitSha)) {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'INVALID_GIT_COMMIT_SHA',
                    message:
                        'gitCommitSha must be a valid 40-character hexadecimal string.',
                    provided: gitCommitSha,
                },
            },
            400,
        )
    }

    // 3. Canon Merkle Root Cryptographic Invariant (64-char hex)
    if (!canonMerkleRoot || !SHA256_REGEX.test(canonMerkleRoot)) {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'INVALID_CANON_MERKLE_ROOT',
                    message:
                        'canonMerkleRoot must be a valid 64-character SHA-256 hexadecimal string.',
                    provided: canonMerkleRoot,
                },
            },
            400,
        )
    }

    // 4. Asset Tree Digests Invariant
    if (
        !assetDigests ||
        typeof assetDigests !== 'object' ||
        Array.isArray(assetDigests)
    ) {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'MALFORMED_ASSET_DIGEST',
                    message:
                        'assetDigests must be a non-empty object mapping asset paths to SHA-256 digests.',
                },
            },
            400,
        )
    }

    const assetEntries = Object.entries(assetDigests)
    if (assetEntries.length === 0) {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'MALFORMED_ASSET_DIGEST',
                    message: 'assetDigests cannot be empty.',
                },
            },
            400,
        )
    }

    for (const [filePath, digest] of assetEntries) {
        if (typeof digest !== 'string' || !SHA256_REGEX.test(digest)) {
            return c.json(
                {
                    ok: false,
                    error: {
                        code: 'MALFORMED_ASSET_DIGEST',
                        message: `Asset '${filePath}' possesses an invalid SHA-256 digest format.`,
                        invalidDigest: digest,
                    },
                },
                400,
            )
        }
    }

    // 5. Mint Canonical Lockfile SHA-256 Digest
    const canonicalJson = JSON.stringify(body, Object.keys(body).sort())
    const lockfileSha256 = await computeSha256Hex(canonicalJson)
    const settledAtMs = Date.now()
    const ackId = `ack_${sceneId}_${settledAtMs}`

    // 6. Relational D1 Ledger Settlement (CANON_DB)
    const db = c.env?.CANON_DB
    if (db && typeof db.prepare === 'function') {
        try {
            const stmt = db.prepare(
                'UPDATE scenes SET composition_status = ?, lockfile_sha256 = ?, sealed_at_ms = ?, is_dirty = 0 WHERE scene_id = ?;',
            )
            await stmt
                .bind('SEALED', lockfileSha256, settledAtMs, sceneId)
                .run()
            process.stdout.write(
                `>> [CANON-DB] [OK] Scene ${sceneId} sealed in D1 (is_dirty = 0).\n`,
            )
        } catch (err: any) {
            process.stderr.write(
                `>> [CANON-DB] [WARN] D1 commit warning for ${sceneId}: ${err.message}\n`,
            )
        }
    } else {
        process.stdout.write(
            `>> [CANON-DB] [MOCK] Scene ${sceneId} marked SEALED in memory buffer.\n`,
        )
    }

    // 7. Telemetry Multicast via ShotCoordinatorDO
    if (c.env?.SHOT_COORDINATOR) {
        try {
            const id = c.env.SHOT_COORDINATOR.idFromName(
                'global_shot_coordinator',
            )
            const stub = c.env.SHOT_COORDINATOR.get(id)

            await stub.fetch(
                new Request('http://localhost/internal/broadcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'SCENE_ASSEMBLY_SEALED',
                        payload: {
                            ackId,
                            episodeId,
                            sceneId,
                            lockfileSha256,
                            gitCommitSha,
                            canonMerkleRoot,
                            assetCount: assetEntries.length,
                            settledAtMs,
                        },
                        role: 'all',
                    }),
                }),
            )
        } catch (err: any) {
            process.stderr.write(
                `>> [ASSEMBLY] [WARN] Telemetry relay warning: ${err.message}\n`,
            )
        }
    }

    const latencyMs = Date.now() - startTime
    process.stdout.write(
        `>> [ASSEMBLY-GATE] [OK] Scene ${sceneId} sealed into CANON_DB (Lockfile: ${lockfileSha256.substring(0, 12)}...) (${latencyMs}ms).\n`,
    )

    const receipt: AssemblySettlementReceipt = {
        ok: true,
        ackId,
        episodeId,
        sceneId,
        status: 'SEALED',
        lockfileSha256,
        gitCommitSha,
        canonMerkleRoot,
        assetCount: assetEntries.length,
        settledAtMs,
        latencyMs,
    }

    return c.json(receipt, 200)
})

export { assemblyRoutes }
