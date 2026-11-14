import { z } from 'zod'
import PipelineBit from './pipeline.bit.js'

export const EpisodeStackSceneEntrySchema = z
    .object({
        sequence_index: z.number().int().min(0),
        file_name: z.string().min(1),
        scene_id: z.string().min(1),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        start_time_hm: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        daypart: z.string().min(1),
        turn_count: z.number().int().min(0),
        frame_count: z.number().int().min(1),
        episode_from_frame: z.number().int().min(0),
        episode_to_frame: z.number().int().min(0),
        episode_from_timecode: z.string().min(1),
        episode_to_timecode: z.string().min(1),
        scene_timecode: z.string().min(1),
        six_category_valid: z.boolean(),
        script_sha256: z.string().regex(/^[0-9a-f]{64}$/),
        agenda_beat_id: z
            .string()
            .regex(/^[a-z0-9_]+$/)
            .optional(),
        scheduled_time: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}\s([01]\d|2[0-3]):[0-5]\d$/)
            .optional(),
        reserve_held_ticks: z.number().int().min(0).max(1000).optional(),
        agendaTentpole: z.boolean().optional(),
        slateLeadPauseFrames: z.number().int().min(0).optional(),
    })
    .strict()

export type EpisodeStackSceneEntry = z.infer<
    typeof EpisodeStackSceneEntrySchema
>

export const AgendaComplianceMatchedBeatSchema = z
    .object({
        beat_id: z.string().min(1),
        scene_id: z.string().min(1).optional(),
        isoDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
        timingDeltaSeconds: z.number().int(),
    })
    .strict()

export type AgendaComplianceMatchedBeat = z.infer<
    typeof AgendaComplianceMatchedBeatSchema
>

export const AgendaComplianceReportSchema = z
    .object({
        compliant: z.boolean(),
        expectedCount: z.number().int().min(0),
        realizedCount: z.number().int().min(0),
        matchedBeats: z.array(AgendaComplianceMatchedBeatSchema),
        missingBeatIds: z.array(z.string().min(1)),
    })
    .strict()

export type AgendaComplianceReport = z.infer<
    typeof AgendaComplianceReportSchema
>

export const EpisodeStackManifestSchema = z
    .object({
        schema_version: z.literal('1.0.0'),
        scene_count: z.number().int().min(0),
        total_frames: z.number().int().min(0),
        total_duration_ms: z.number().int().min(0),
        scenes: z.array(EpisodeStackSceneEntrySchema),
        agendaCompliance: AgendaComplianceReportSchema.optional(),
    })
    .strict()

export type EpisodeStackManifest = z.infer<typeof EpisodeStackManifestSchema>

export default interface Pipeline {
    idx: string
    pipelineBitList: PipelineBit[]
    pipelineBits: Record<string, unknown>
    lastBatchManifest: EpisodeStackManifest | null
    processedSceneCount: number
}
