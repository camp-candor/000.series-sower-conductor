import crypto from 'node:crypto'
import { ReceiptModel } from '../receipt.model.js'
import ReceiptBit from '../fce/receipt.bit.js'
import {
    EpisodeStackReceipt,
    EpisodeStackReceiptSchema,
} from '../fce/receipt.interface.js'
import { EpisodeStackManifest } from '../../16.pipeline.unit/fce/pipeline.interface.js'
import { canonicalJsonStringify } from '../../30.canon.unit/buz/canon.buzz.js'
import State from '../../99.core/state.js'

export function sealEpisodeStackReceipt(
    manifest: EpisodeStackManifest,
): EpisodeStackReceipt {
    const normalizedScenes = [...manifest.scenes]
        .sort((a, b) =>
            a.file_name < b.file_name ? -1 : a.file_name > b.file_name ? 1 : 0,
        )
        .map((s) => ({
            daypart: s.daypart,
            episode_from_frame: s.episode_from_frame,
            episode_from_timecode: s.episode_from_timecode,
            episode_to_frame: s.episode_to_frame,
            episode_to_timecode: s.episode_to_timecode,
            file_name: s.file_name,
            frame_count: s.frame_count,
            scene_id: s.scene_id,
            scene_timecode: s.scene_timecode,
            script_sha256: s.script_sha256,
            sequence_index: s.sequence_index,
            six_category_valid: s.six_category_valid,
            start_date: s.start_date,
            start_time_hm: s.start_time_hm,
            turn_count: s.turn_count,
        }))
    const normalized = {
        schema_version: '1.0.0' as const,
        scene_count: manifest.scene_count,
        scenes: normalizedScenes,
        total_duration_ms: manifest.total_duration_ms,
        total_frames: manifest.total_frames,
    }
    const manifestSha256 = crypto
        .createHash('sha256')
        .update(canonicalJsonStringify(normalized), 'utf8')
        .digest('hex')
    const receipt: EpisodeStackReceipt = {
        schema_version: '1.0.0',
        scene_count: manifest.scene_count,
        total_frames: manifest.total_frames,
        total_duration_ms: manifest.total_duration_ms,
        manifest_sha256: manifestSha256,
        all_six_categories_verified: manifest.scenes.every(
            (s) => s.six_category_valid === true,
        ),
    }
    EpisodeStackReceiptSchema.parse(receipt)
    return Object.freeze({ ...receipt }) as EpisodeStackReceipt
}

export const initReceipt = (
    cpy: ReceiptModel,
    bal: ReceiptBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ receiptBit: { idx: 'init-receipt', val: 1 } })
    return cpy
}

export const updateReceipt = (
    cpy: ReceiptModel,
    bal: ReceiptBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ receiptBit: { idx: 'update-receipt', val: 1 } })
    return cpy
}

export const sealEpisodeStack = async (
    cpy: ReceiptModel,
    bal: ReceiptBit,
    _ste: State,
) => {
    const manifest = bal.dat?.manifest as EpisodeStackManifest
    if (!manifest) {
        throw new Error('[RECEIPT_MISSING_MANIFEST] dat.manifest required')
    }
    const receipt = sealEpisodeStackReceipt(manifest)
    cpy.lastReceipt = receipt
    const line = `>> [RECEIPT:EPISODE_SEAL] scenes=${receipt.scene_count} frames=${receipt.total_frames} sha=${receipt.manifest_sha256}`
    if (global.LIBRARY) {
        await global.LIBRARY.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: line,
        }).catch(() => {})
    } else {
        process.stdout.write(`${line}\n`)
    }
    if (bal.slv)
        bal.slv({
            rctBit: {
                idx: 'seal-episode-stack-receipt-success',
                val: 1,
                dat: { receipt },
            },
        })
    return cpy
}
