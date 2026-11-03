import { Model } from '../../99.core/interface/model.interface.js';

export interface SomaticMeters {
  somaticFatigueBps: number;    // 0 to 10000 bps
  physicalPainBps: number;      // 0 to 10000 bps
  refusalStrainBps: number;     // 0 to 10000 bps
  paranoiaPressureBps: number;  // 0 to 10000 bps
}

export interface SomaticDspInput {
  characterId: string;
  dialogueText: string;
  emotionalTag: string;
  basePacing?: number;
  pitchShiftCents?: number;
  breathinessBps?: number;
  vocalFryBps?: number;
  gainAttenuationBps?: number;
  activeConditions?: string[];
  bannedKineticVerbs?: string[];
  meters?: Partial<SomaticMeters>;
}

export interface TTSDspModifiers {
  basePitchShiftSemitones: number;
  formantWarpingFactor: number;
  breathinessPauseMultiplier: number;
  pause_frequency_multiplier: number;
  vocalFryDensity: number;
  target_lufs: number;
  peak_dbtp: number;
  bannedCadences: string[];
}

export interface TTSGenerationPayload {
  character: string;
  text: string;
  emotion: string;
  tonePacing: number;
  dsp_modifiers: TTSDspModifiers;
}

export default interface Somaticdsp extends Model {
  idx: string;
  totalTranslationsExecuted: number;
  lastTranslatedPayload: TTSGenerationPayload | null;
}
