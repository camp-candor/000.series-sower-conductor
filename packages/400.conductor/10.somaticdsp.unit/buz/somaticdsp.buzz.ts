import { SomaticdspModel } from '../somaticdsp.model.js';
import SomaticdspBit from '../fce/somaticdsp.bit.js';
import {
  CharacterSomaticState,
  DialogueSomaticInput,
  AcousticDspModifiers,
  SomaticDspReceipt,
  BannedCadence,
} from '../fce/somaticdsp.interface.js';
import {
  CharacterSomaticStateSchema,
  DialogueSomaticInputSchema,
} from '../val/somaticdsp.val.js';
import State from '../../99.core/state.js';

export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

export const mapSomaticToAcousticDsp = (
  state: CharacterSomaticState,
  input: DialogueSomaticInput,
): AcousticDspModifiers => {
  // 1. Phonation Feasibility Evaluation Gate
  if (!state.is_conscious) {
    throw new Error('VOCAL_DELIVERY_BREACH: Actor is unconscious');
  }
  if (state.active_conditions.includes('mute')) {
    throw new Error('VOCAL_DELIVERY_BREACH: Actor carries active mute condition');
  }
  if (state.active_conditions.includes('cnd_vocal_cord_transected')) {
    throw new Error('VOCAL_DELIVERY_BREACH: Actor vocal cords are transected');
  }
  if (state.active_conditions.includes('bilateral_vocal_cord_paralysis')) {
    throw new Error('VOCAL_DELIVERY_BREACH: Bilateral vocal cord paralysis present');
  }
  if (state.banned_kinetic_verbs.includes('speak')) {
    throw new Error('VOCAL_DELIVERY_BREACH: speak verb is in banned_kinetic_verbs');
  }

  // 2. Fundamental Frequency Pitch Transposition (F0,eff)
  // F0,eff = basePitch + (cents / 100) + (+3.5 * pain / 10000) + (-2.0 * fatigue / 10000)
  const basePitch = input.base_pitch_shift_semitones ?? 0.0;
  const centsShift = (input.pitch_shift_cents ?? 0) / 100.0;
  const painPitchMod = 3.5 * (state.pain_bps / 10000.0);
  const fatiguePitchMod = -2.0 * (state.fatigue_bps / 10000.0);
  let effectivePitch = basePitch + centsShift + painPitchMod + fatiguePitchMod;

  if (state.active_conditions.includes('crushed_larynx')) {
    effectivePitch -= 4.0;
  }
  effectivePitch = clamp(effectivePitch, -12.0, 12.0);

  // 3. Formant Warping Factor (Weff)
  // Weff = formantBase * (1.0 + delta_formant_bps / 10000)
  const baseFormant = input.formant_warping_factor ?? 1.0;
  const deltaFormant = (input.delta_formant_bps ?? 0) / 10000.0;
  let effectiveFormant = baseFormant * (1.0 + deltaFormant);

  if (state.active_conditions.includes('crushed_larynx')) {
    effectiveFormant = Math.min(effectiveFormant, 0.7);
  }
  effectiveFormant = clamp(effectiveFormant, 0.5, 2.0);

  // 4. Breath Interval Dilation (Peff)
  // Peff = baseBreath * (1.0 + 1.40 * (fatigue / 10000)^2) * (1.0 + breathiness_bps / 10000)
  const baseBreath = input.base_breathiness ?? 1.0;
  const fatigueRatio = state.fatigue_bps / 10000.0;
  const breathMod = (input.breathiness_bps ?? 0) / 10000.0;
  let effectiveBreath = baseBreath * (1.0 + 1.4 * Math.pow(fatigueRatio, 2)) * (1.0 + breathMod);
  effectiveBreath = clamp(effectiveBreath, 1.0, 3.5);

  // 5. Pause Frequency Multiplier
  let pauseMultiplier = 1.0;
  if (state.fatigue_bps >= 8000) {
    pauseMultiplier = 2.8;
  } else if (state.active_conditions.includes('punctured_lung') || state.active_conditions.includes('acute_asphyxiation')) {
    pauseMultiplier = 1.4;
  }

  // 6. Subharmonic Vocal Fry Density (Phieff)
  // Phieff = clamp(baseFry + 0.50 * fatigue + 0.40 * pain + fry_bps, 0.0, 1.0)
  const baseFry = input.base_vocal_fry ?? 0.0;
  const fryMod = (input.vocal_fry_bps ?? 0) / 10000.0;
  let effectiveFry = baseFry + 0.5 * fatigueRatio + 0.4 * (state.pain_bps / 10000.0) + fryMod;
  effectiveFry = clamp(effectiveFry, 0.0, 1.0);

  // 7. Banned Cadences Roll-Up
  const bannedCadences: BannedCadence[] = [];
  if (state.fatigue_bps > 5000 || state.active_conditions.includes('punctured_lung')) {
    bannedCadences.push('RAPID_STACCATO');
  }
  if (state.pain_bps > 4000) {
    bannedCadences.push('CHEERFUL_MODULATION', 'UPBEAT_LILT', 'SING_SONG_RESONANCE');
  }

  return {
    effective_pitch_semitones: Number(effectivePitch.toFixed(3)),
    effective_formant_warping: Number(effectiveFormant.toFixed(3)),
    effective_breathiness_multiplier: Number(effectiveBreath.toFixed(3)),
    pause_frequency_multiplier: Number(pauseMultiplier.toFixed(3)),
    effective_vocal_fry_density: Number(effectiveFry.toFixed(3)),
    target_lufs: -16.0,
    peak_dbtp: -1.0,
    banned_cadences: bannedCadences,
  };
};

export const initSomaticdsp = (
  cpy: SomaticdspModel,
  bal: SomaticdspBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ smtBit: { idx: 'init-somaticdsp', val: 1 } });
  }
  return cpy;
};

export const updateSomaticdsp = (
  cpy: SomaticdspModel,
  bal: SomaticdspBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ smtBit: { idx: 'update-somaticdsp' } });
  }
  return cpy;
};

export const translateSomaticDsp = async (
  cpy: SomaticdspModel,
  bal: SomaticdspBit,
  ste: State,
) => {
  try {
    if (!bal.dat?.somaticState || !bal.dat?.somaticInput) {
      throw new Error('MISSING_PAYLOAD: somaticState and somaticInput are required');
    }

    const validatedState = CharacterSomaticStateSchema.parse(bal.dat.somaticState) as CharacterSomaticState;
    const validatedInput = DialogueSomaticInputSchema.parse(bal.dat.somaticInput) as DialogueSomaticInput;

    cpy.characterProfiles[validatedState.character_id] = validatedState;

    const modifiers = mapSomaticToAcousticDsp(validatedState, validatedInput);

    const receipt: SomaticDspReceipt = {
      ok: true,
      character_id: validatedState.character_id,
      modifiers,
    };

    cpy.lastReceipt = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [SOMATIC-DSP] [OK] Translated [${validatedState.character_id}]: Pitch=${modifiers.effective_pitch_semitones}st, Formant=${modifiers.effective_formant_warping}, Fry=${modifiers.effective_vocal_fry_density}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        smtBit: {
          idx: 'translate-somatic-dsp-success',
          dat: { receipt },
        },
      });
    }
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    const receipt: SomaticDspReceipt = {
      ok: false,
      character_id: bal.dat?.somaticState?.character_id || 'UNKNOWN_ACTOR',
      breach_reason: errorMsg,
    };

    cpy.lastReceipt = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [SOMATIC-DSP] [FAIL] ${errorMsg} at T0 ($0.00 spend)`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        smtBit: {
          idx: 'translate-somatic-dsp-error',
          src: errorMsg,
          dat: { receipt },
        },
      });
    }
  }

  return cpy;
};

