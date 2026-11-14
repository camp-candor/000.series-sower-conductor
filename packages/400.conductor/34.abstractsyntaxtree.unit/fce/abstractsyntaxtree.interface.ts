import { z } from 'zod'
import { Model } from '../../99.core/interface/model.interface.js'

export const SomaticDspModifiersSchema = z
    .object({
        gain_attenuation_bps: z.number().int().min(0).max(10000).default(0),
        pitch_shift_cents: z.number().int().min(-1200).max(1200).default(0),
        breathiness_bps: z.number().int().min(0).max(10000).default(0),
        ducking_depth_db: z.number().int().min(-40).max(0).default(-14),
    })
    .strict()

export const MotivationReactionUnitSchema = z
    .object({
        mru_phase: z.enum([
            'MOTIVATION',
            'FEELING',
            'REFLEX',
            'RATIONAL_ACTION',
        ]),
        stimulus_id: z.string().min(1),
        intensity_bps: z.number().int().min(0).max(10000),
    })
    .strict()

export const DialogueLineSchema = z
    .object({
        line_id: z.string().min(1),
        speaker_id: z.string().min(1),
        dialogue_clean_ascii: z
            .string()
            .min(1)
            .regex(/^[\x20-\x7E\r\n\t]+$/, 'Pure 7-bit ASCII text required'),
        emotional_tag: z.enum([
            'COLD_RESENTMENT',
            'FEAR',
            'DOMINANT',
            'SUBSERVIENT',
            'PANIC',
            'NEUTRAL',
        ]),
        somatic_dsp: SomaticDspModifiersSchema,
        mru_directive: MotivationReactionUnitSchema,
    })
    .strict()

export const CameraFramingSchema = z
    .object({
        shot_type: z.enum([
            'CLOSE_UP',
            'MEDIUM_SHOT',
            'WIDE_ESTABLISHING',
            'DUTCH_ANGLE',
            'OVER_THE_SHOULDER',
        ]),
        focal_entity_id: z.string().min(1),
        secondary_entity_id: z.string().optional(),
    })
    .strict()

export const SceneChronologySchema = z
    .object({
        calendar_system: z.literal('GREGORIAN_24H').default('GREGORIAN_24H'),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        start_time_hm: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        start_time_hms: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
            .optional(),
        timecode_smpte: z.string().regex(/^\d{2}:[0-5]\d:[0-5]\d:\d{2}$/),
        daypart: z.enum(['DAWN', 'MORNING', 'AFTERNOON', 'DUSK', 'NIGHT']),
        tick_index: z.number().int().min(0).optional(),
        tick_seconds: z.number().int().min(1).default(60),
        frames_per_second: z.number().int().min(1).default(24),
        timezone_label: z.string().min(1).optional(),
        era_label: z.string().min(1).optional(),
    })
    .strict()

export type SceneChronology = z.infer<typeof SceneChronologySchema>

export const SceneASTSchema = z
    .object({
        scene_id: z.string().min(1),
        episode_number: z.number().int().positive(),
        sequence_index: z.number().int().nonnegative(),
        state_snapshot_hash: z
            .string()
            .length(64)
            .regex(
                /^[a-f0-9]{64}$/,
                'Must be 64-char lowercase hex SHA-256 hash',
            ),
        pinned_fact_version: z.number().int().positive(),
        environment_id: z.string().min(1),
        camera_framing: CameraFramingSchema,
        lines: z.array(DialogueLineSchema).min(1),
        chronology: SceneChronologySchema.optional(),
    })
    .strict()

export type SomaticDspModifiers = z.infer<typeof SomaticDspModifiersSchema>
export type MotivationReactionUnit = z.infer<
    typeof MotivationReactionUnitSchema
>
export type DialogueLine = z.infer<typeof DialogueLineSchema>
export type CameraFraming = z.infer<typeof CameraFramingSchema>
export type SceneAST = z.infer<typeof SceneASTSchema>

export default interface AbstractSyntaxTree extends Model {
    lastParsedSceneId: string
    totalLinesValidated: number
    activeScene: Readonly<SceneAST> | null
}
