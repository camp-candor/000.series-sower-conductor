import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
    UniversalProvenanceManifest,
    WormEmissionReceipt,
} from '../fce/provenance.interface.js'
import { computeFileSha256 } from './lockfileMinting.buzz.js'

export async function emitWormSnapshots(
    sceneId: string,
    manifest: UniversalProvenanceManifest,
    vaultDir?: string,
): Promise<WormEmissionReceipt> {
    const targetDir = vaultDir || path.resolve(process.cwd(), 'vault/snapshots')
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    const manifestJson = JSON.stringify(manifest, null, 2)

    // 1. Primary un-timestamped canonical HEAD
    const primarySnapshotPath = path.join(
        targetDir,
        `build_${sceneId}.lock.json`,
    )

    // 2. Windows-safe WORM historical snapshot (ISO-8601 with colons replaced by hyphens)
    const isoString = new Date(manifest.sealedAtMs).toISOString()
    const safeTimestamp = isoString.replace(/:/g, '-')
    const wormSnapshotPath = path.join(
        targetDir,
        `build_${sceneId}_${safeTimestamp}.lock.json`,
    )

    // Safe atomic staging via temporary files
    const tmpPrimary = `${primarySnapshotPath}.tmp_${crypto.randomUUID()}`
    const tmpWorm = `${wormSnapshotPath}.tmp_${crypto.randomUUID()}`

    fs.writeFileSync(tmpPrimary, manifestJson, 'utf8')
    fs.writeFileSync(tmpWorm, manifestJson, 'utf8')

    fs.renameSync(tmpPrimary, primarySnapshotPath)
    fs.renameSync(tmpWorm, wormSnapshotPath)

    const primarySha256 = computeFileSha256(primarySnapshotPath)
    const wormSha256 = computeFileSha256(wormSnapshotPath)
    const identical = primarySha256 === wormSha256

    process.stdout.write(
        `>> [WORM] [OK] Dual WORM snapshots emitted to vault/snapshots/ (SHA-256: ${primarySha256.slice(0, 16)}...).\n`,
    )

    return {
        ok: identical,
        primarySnapshotPath,
        wormSnapshotPath,
        primarySha256,
        wormSha256,
        identical,
        t0Spend: '$0.00',
    }
}
