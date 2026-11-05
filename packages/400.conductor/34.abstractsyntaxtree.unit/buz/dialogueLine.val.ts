import { z } from 'zod';

export const SwainMRUBeatTypeSchema = z.enum([
  'MOTIVATION_STIMULUS',
  'SOMATIC_REACTION',
  'INTERNAL_PROCESSING',
  'MOTOR_ACTION_DIALOGUE',
  'VISCERAL_STING',
]);

export const CameraIntentSchema = z
  .object({
    framing: z.enum(['EXTREME_CLOSE_UP', 'CLOSE_UP', 'MEDIUM', 'WIDE']),
    motion: z.enum(['STATIC', 'SLOW_PUSH', 'WHIP_PAN', 'DUTCH_TILT']),
    focus_target: z.string().min(1),
  })
  .strict();

export const DialogueLineSchema = z
  .object({
    line_id: z.string().regex(/^line_[0-9]{3,}$/, 'line_id must match line_XXX format'),
    speaker_id: z.string().min(1, 'speaker_id cannot be empty'),
    dialogue_text: z
      .string()
      .min(1, 'dialogue_text cannot be empty')
      .regex(/^[\x20-\x7E\r\n\t]*$/, 'dialogue_text must contain only printable 7-bit clean ASCII characters'),
    camera_parenthetical: z.string().default(''),
    observable_parenthetical: z.string().default(''),
    emotion_tag: z.string().min(1, 'emotion_tag cannot be empty'),
    swain_mru_phase: SwainMRUBeatTypeSchema.default('MOTOR_ACTION_DIALOGUE'),
    tonePacing: z.number().min(0.5).max(2.0).default(1.0),
    extracted_motor_actions: z.array(z.string()).default([]),
    foley_cues: z.array(z.string()).default([]),
    camera_intent: CameraIntentSchema.optional(),
    pacing_scalar: z.number().min(0.1).max(5.0).default(1.0),
  })
  .strict();

export const SceneASTSchema = z
  .object({
    schema_version: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
    series_id: z.string().min(1),
    episode_id: z.string().min(1),
    scene_id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    state_snapshot_hash: z
      .string()
      .regex(/^(sha256:)?[0-9a-f]{64}$/, 'state_snapshot_hash must be a valid 64-char hex string'),
    lines: z.array(DialogueLineSchema).min(1, 'Scene AST must contain at least one dialogue line'),
    pinned_version: z.number().int().nonnegative().default(0),
  })
  .strict();
