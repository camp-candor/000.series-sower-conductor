import { z } from 'zod';

export const RawStemDurationSchema = z
  .object({
    shot_id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'shot_id must be alphanumeric'),
    duration_ms: z.number().positive('duration_ms must be positive and non-zero'),
    sample_count: z.number().int().nonnegative().optional(),
  })
  .strict();

export const FrameQuantizationRequestSchema = z
  .object({
    stems: z.array(RawStemDurationSchema).min(1, 'stems array must contain at least one shot'),
  })
  .strict();
