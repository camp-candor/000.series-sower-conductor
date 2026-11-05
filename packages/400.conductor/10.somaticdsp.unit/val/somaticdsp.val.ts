import { z } from 'zod';

export const VocalTractConditionSchema = z.enum([
  'mute',
  'cnd_vocal_cord_transected',
  'crushed_larynx',
  'bilateral_vocal_cord_paralysis',
  'punctured_lung',
  'acute_asphyxiation',
  'concussive_shock',
]);

export const BannedCadenceSchema = z.enum([
  'RAPID_STACCATO',
  'RISING_INFLECTION_INTERROGATIVE',
  'CHEERFUL_MODULATION',
  'UPBEAT_LILT',
  'SING_SONG_RESONANCE',
]);

export const CharacterSomaticStateSchema = z
  .object({
    character_id: z.string().regex(/^char_[a-z0-9_]+$/),
    fatigue_bps: z.number().int().min(0).max(10000),
    pain_bps: z.number().int().min(0).max(10000),
    refusal_strain_bps: z.number().int().min(0).max(10000),
    is_conscious: z.boolean().default(true),
    active_conditions: z.array(VocalTractConditionSchema).default([]),
    banned_kinetic_verbs: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const DialogueSomaticInputSchema = z
  .object({
    character_id: z.string().regex(/^char_[a-z0-9_]+$/),
    base_pitch_shift_semitones: z.number().min(-12.0).max(12.0).default(0.0),
    pitch_shift_cents: z.number().int().default(0),
    formant_warping_factor: z.number().min(0.5).max(2.0).default(1.0),
    delta_formant_bps: z.number().int().default(0),
    base_breathiness: z.number().min(1.0).max(3.5).default(1.0),
    breathiness_bps: z.number().int().min(0).max(10000).default(0),
    base_vocal_fry: z.number().min(0.0).max(1.0).default(0.0),
    vocal_fry_bps: z.number().int().min(0).max(10000).default(0),
  })
  .strict();
