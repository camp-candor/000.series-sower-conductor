export type AnatomicalLocus =
  | 'CRANIAL'
  | 'CERVICAL_SPINE'
  | 'LARYNX'
  | 'PULMONARY_SYSTEM'
  | 'BRACHIAL_PLEXUS_RIGHT'
  | 'BRACHIAL_PLEXUS_LEFT'
  | 'FEMORAL_RIGHT'
  | 'FEMORAL_LEFT';

export type VocalTractCondition =
  | 'mute'
  | 'cnd_vocal_cord_transected'
  | 'crushed_larynx'
  | 'bilateral_vocal_cord_paralysis'
  | 'punctured_lung'
  | 'acute_asphyxiation'
  | 'concussive_shock';

export type BannedCadence =
  | 'RAPID_STACCATO'
  | 'RISING_INFLECTION_INTERROGATIVE'
  | 'CHEERFUL_MODULATION'
  | 'UPBEAT_LILT'
  | 'SING_SONG_RESONANCE';

export interface CharacterSomaticState {
  character_id: string;
  fatigue_bps: number; // 0..10000 bps
  pain_bps: number; // 0..10000 bps
  refusal_strain_bps: number; // 0..10000 bps
  is_conscious: boolean;
  active_conditions: VocalTractCondition[];
  banned_kinetic_verbs: string[];
}

export interface DialogueSomaticInput {
  character_id: string;
  base_pitch_shift_semitones?: number;
  pitch_shift_cents?: number;
  formant_warping_factor?: number;
  delta_formant_bps?: number;
  base_breathiness?: number;
  breathiness_bps?: number;
  base_vocal_fry?: number;
  vocal_fry_bps?: number;
}

export interface AcousticDspModifiers {
  effective_pitch_semitones: number;
  effective_formant_warping: number;
  effective_breathiness_multiplier: number;
  pause_frequency_multiplier: number;
  effective_vocal_fry_density: number;
  target_lufs: number;
  peak_dbtp: number;
  banned_cadences: BannedCadence[];
}

export interface SomaticDspReceipt {
  ok: boolean;
  character_id: string;
  modifiers?: AcousticDspModifiers;
  breach_reason?: string;
}

export default interface Somaticdsp {
  idx: string;
  characterProfiles: Record<string, CharacterSomaticState>;
  lastReceipt?: SomaticDspReceipt;
}
