// packages/400.conductor/32.audio.unit/val/audio.val.ts
import { z } from 'zod'

export const DialogueWindowSchema = z
    .object({
        shot_id: z.string().min(1),
        from_frame: z.number().int().nonnegative(),
        to_frame: z.number().int().nonnegative(),
        stem_path: z.string().min(1),
        speaker_id: z.string().min(1),
    })
    .strict()

export const FoleyCueItemSchema = z
    .object({
        shot_id: z.string().min(1),
        frame_offset: z.number().int().nonnegative(),
        cue_name: z.string().min(1),
        resolved_sample: z.string().min(1),
        volume: z.number().min(0.0).max(1.0).default(0.8),
    })
    .strict()

export const DuckingGainNodeSchema = z
    .object({
        frame: z.number().int().nonnegative(),
        gain: z.number().min(0.0).max(1.0),
    })
    .strict()

export const ExposureSheetDocumentSchema = z
    .object({
        schema_version: z.string().default('1.0.0'),
        series_id: z.string().min(1),
        scene_id: z.string().min(1),
        total_frames: z.number().int().positive(),
        total_duration_ms: z.number().positive(),
        tracks: z
            .object({
                track1_dialogue: z.array(z.any()),
                track2_foley: z.array(FoleyCueItemSchema),
                track3_ambient: z
                    .object({
                        ambient_loop_path: z.string().min(1),
                        base_volume: z.number().min(0.0).max(1.0).default(0.4),
                        ducked_volume: z.number().min(0.0).max(1.0),
                        ducking_keyframes: z.array(DuckingGainNodeSchema),
                    })
                    .strict(),
            })
            .strict(),
    })
    .strict()
