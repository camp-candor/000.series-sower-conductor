import crypto from 'node:crypto'
import { ReceiptModel } from '../receipt.model.js'
import ReceiptBit from '../fce/receipt.bit.js'
import {
    EpisodeStackReceipt,
    EpisodeStackReceiptSchema,
} from '../fce/receipt.interface.js'
import { EpisodeStackManifest } from '../../16.pipeline.unit/fce/pipeline.interface.js'
import { canonicalJsonStringify } from '../../30.canon.unit/buz/canon.buzz.js'
import { compileAutoScriptDirectoryPipeline } from '../../16.pipeline.unit/buz/pipeline.buzz.js'
import State from '../../99.core/state.js'

export function sealEpisodeStackReceipt(
    manifest: EpisodeStackManifest,
): EpisodeStackReceipt {
    const normalizedScenes = [...manifest.scenes]
        .sort((a, b) =>
            a.file_name < b.file_name ? -1 : a.file_name > b.file_name ? 1 : 0,
        )
        .map((s) => ({
            agenda_beat_id: (s as Record<string, any>).agenda_beat_id,
            agendaTentpole: (s as Record<string, any>).agendaTentpole,
            daypart: s.daypart,
            episode_from_frame: s.episode_from_frame,
            episode_from_timecode: s.episode_from_timecode,
            episode_to_frame: s.episode_to_frame,
            episode_to_timecode: s.episode_to_timecode,
            file_name: s.file_name,
            frame_count: s.frame_count,
            reserve_held_ticks: (s as Record<string, any>).reserve_held_ticks,
            scene_id: s.scene_id,
            scene_timecode: s.scene_timecode,
            scheduled_time: (s as Record<string, any>).scheduled_time,
            script_sha256: s.script_sha256,
            sequence_index: s.sequence_index,
            six_category_valid: s.six_category_valid,
            slateLeadPauseFrames: (s as Record<string, any>)
                .slateLeadPauseFrames,
            start_date: s.start_date,
            start_time_hm: s.start_time_hm,
            turn_count: s.turn_count,
        }))
    const agendaCompliance = (manifest as Record<string, any>)
        .agendaCompliance ?? {
        compliant: true,
        expectedCount: 0,
        realizedCount: 0,
        matchedBeats: [],
        missingBeatIds: [],
    }
    const normalized = {
        agendaCompliance,
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

export function verifyConductorStackReplayEquivalence(
    dirAOrManifestA: string | EpisodeStackManifest,
    dirBOrManifestB: string | EpisodeStackManifest,
): {
    equivalent: boolean
    digestA: string
    digestB: string
    mismatches: string[]
} {
    const manifestA =
        typeof dirAOrManifestA === 'string'
            ? compileAutoScriptDirectoryPipeline(dirAOrManifestA)
            : (dirAOrManifestA as EpisodeStackManifest)
    const manifestB =
        typeof dirBOrManifestB === 'string'
            ? compileAutoScriptDirectoryPipeline(dirBOrManifestB)
            : (dirBOrManifestB as EpisodeStackManifest)
    const receiptA = sealEpisodeStackReceipt(manifestA)
    const receiptB = sealEpisodeStackReceipt(manifestB)
    const digestA = receiptA.manifest_sha256
    const digestB = receiptB.manifest_sha256
    const mismatches: string[] = []
    if (digestA !== digestB) {
        mismatches.push(`manifest_sha256 ${digestA} != ${digestB}`)
    }
    const complianceA = canonicalJsonStringify(
        (manifestA as Record<string, any>).agendaCompliance ?? {},
    )
    const complianceB = canonicalJsonStringify(
        (manifestB as Record<string, any>).agendaCompliance ?? {},
    )
    if (complianceA !== complianceB) {
        mismatches.push('agendaCompliance diverged')
    }
    if (manifestA.scene_count !== manifestB.scene_count) {
        mismatches.push(
            `scene_count ${manifestA.scene_count} != ${manifestB.scene_count}`,
        )
    }
    return { equivalent: mismatches.length === 0, digestA, digestB, mismatches }
}
