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
    })
    .strict()

export type EpisodeStackSceneEntry = z.infer<
    typeof EpisodeStackSceneEntrySchema
>

export const EpisodeStackManifestSchema = z
    .object({
        schema_version: z.literal('1.0.0'),
        scene_count: z.number().int().min(0),
        total_frames: z.number().int().min(0),
        total_duration_ms: z.number().int().min(0),
        scenes: z.array(EpisodeStackSceneEntrySchema),
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
