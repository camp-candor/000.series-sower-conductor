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
