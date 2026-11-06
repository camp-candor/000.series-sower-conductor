import { z } from 'zod'

export const TtsEngineTypeSchema = z.enum(['styletts2', 'parler', 'piper'])

export const DialogueSynthesisItemSchema = z
    .object({
        line_id: z
            .string()
            .regex(/^line_[0-9]{3,}$/, 'line_id must match line_XXX format'),
        speaker_id: z.string().min(1, 'speaker_id cannot be empty'),
        dialogue_text: z
            .string()
            .min(1, 'dialogue_text cannot be empty')
            .regex(
                /^[\x20-\x7E\r\n\t]*$/,
                'dialogue_text must be 7-bit clean ASCII',
            ),
        emotion_tag: z.string().min(1),
        tonePacing: z.number().min(0.5).max(2.0).default(1.0),
        dsp_modifiers: z.any().optional(),
        output_filename: z.string().optional(),
    })
    .strict()

export const SpeechGenerationRequestSchema = z
    .object({
        series_id: z.string().min(1),
        scene_id: z.string().min(1),
        engine: TtsEngineTypeSchema.default('styletts2'),
        items: z
            .array(DialogueSynthesisItemSchema)
            .min(1, 'items array cannot be empty'),
        output_directory: z.string().optional(),
    })
    .strict()
