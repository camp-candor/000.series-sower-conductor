export type AnatomicalLocus =
    | 'CRANIAL'
    | 'CERVICAL_SPINE'
    | 'LARYNX'
    | 'PULMONARY_SYSTEM'
    | 'BRACHIAL_PLEXUS_RIGHT'
    | 'BRACHIAL_PLEXUS_LEFT'
    | 'FEMORAL_RIGHT'
    | 'FEMORAL_LEFT'

export type VocalTractCondition =
    | 'mute'
    | 'cnd_vocal_cord_transected'
    | 'crushed_larynx'
    | 'cnd_crushed_laryngeal_cartilage'
    | 'cnd_severe_hypothermia'
    | 'cnd_physiological_shock'
    | 'cnd_pulmonary_fibrosis_stage_1'
    | 'cnd_gas_inhalation_damage'
    | 'cnd_spinal_vertebral_compression'
    | 'bilateral_vocal_cord_paralysis'
    | 'punctured_lung'
    | 'acute_asphyxiation'
    | 'concussive_shock'

export type BannedCadence =
    | 'RAPID_STACCATO'
    | 'RISING_INFLECTION_INTERROGATIVE'
    | 'RISING_INFLECTION'
    | 'MONOTONE_FLAT'
    | 'UPBEAT_LILT'
    | 'CHEERFUL_MODULATION'
    | 'SING_SONG_RESONANCE'

export interface SomaticMeters {
    somaticFatigueBps: number
    physicalPainBps: number
    refusalStrainBps: number
    paranoiaPressureBps: number
}

export interface CharacterSomaticState {
    character_id: string
    fatigue_bps: number
    pain_bps: number
    refusal_strain_bps?: number
    is_conscious: boolean
    active_conditions: string[]
    banned_kinetic_verbs: string[]
}

export interface DialogueSomaticInput {
    character_id: string
    dialogue_text?: string
    base_pitch_shift_semitones?: number
    pitch_shift_cents?: number
    formant_warping_factor?: number
    delta_formant_bps?: number
    base_breathiness?: number
    breathiness_bps?: number
    base_vocal_fry?: number
    vocal_fry_bps?: number
    base_speed_scalar?: number
}

export interface AcousticDspModifiers {
    basePitchShiftSemitones?: number
    formantWarpingFactor?: number
    breathinessPauseMultiplier?: number
    pause_frequency_multiplier: number
    vocalFryDensity?: number
    tonePacing?: number
    target_lufs: -16.0
    peak_dbtp: -1.0
    bannedCadences?: string[]
    effective_pitch_semitones?: number
    effective_formant_warping?: number
    effective_breathiness_multiplier?: number
    effective_vocal_fry_density?: number
    banned_cadences?: BannedCadence[]
}

export interface SomaticDspReceipt {
    ok: boolean
    character_id: string
    dsp_modifiers?: AcousticDspModifiers
    modifiers?: AcousticDspModifiers
    error?: string
    breach_reason?: string
}

export interface SomaticDspInput {
    characterId: string
    dialogueText: string
    emotionalTag: string
    basePacing?: number
    pitchShiftCents?: number
    breathinessBps?: number
    vocalFryBps?: number
    gainAttenuationBps?: number
    activeConditions?: string[]
    bannedKineticVerbs?: string[]
    meters?: Partial<SomaticMeters>
}

export interface TTSDspModifiers {
    basePitchShiftSemitones: number
    formantWarpingFactor: number
    breathinessPauseMultiplier: number
    pause_frequency_multiplier: number
    vocalFryDensity: number
    target_lufs: -16.0
    peak_dbtp: -1.0
    bannedCadences: string[]
}

export interface TTSGenerationPayload {
    character: string
    text: string
    emotion: string
    tonePacing: number
    dsp_modifiers: TTSDspModifiers
}

export default interface Somaticdsp {
    idx: string
    characterProfiles: Record<string, CharacterSomaticState>
    lastReceipt?: SomaticDspReceipt
    totalTranslationsExecuted?: number
    lastTranslatedPayload?: TTSGenerationPayload | null
}
