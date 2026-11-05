import { describe, it, expect, beforeEach } from 'vitest';
import { SomaticdspModel } from '../10.somaticdsp.unit/somaticdsp.model.js';
import * as Buzz from '../10.somaticdsp.unit/buz/somaticdsp.buzz.js';
import {
  CharacterSomaticState,
  DialogueSomaticInput,
} from '../10.somaticdsp.unit/fce/somaticdsp.interface.js';

describe('10.somaticdsp.unit: Somatic Biological Condition Vector Translation', () => {
  let model: SomaticdspModel;

  beforeEach(() => {
    model = new SomaticdspModel();
  });

  const baseState: CharacterSomaticState = {
    character_id: 'char_bog',
    fatigue_bps: 0,
    pain_bps: 0,
    refusal_strain_bps: 0,
    is_conscious: true,
    active_conditions: [],
    banned_kinetic_verbs: [],
  };

  const baseInput: DialogueSomaticInput = {
    character_id: 'char_bog',
    base_pitch_shift_semitones: 0.0,
    formant_warping_factor: 1.0,
    base_breathiness: 1.0,
    base_vocal_fry: 0.0,
  };

  it('calculates nominal modifiers for healthy neutral character', () => {
    const mods = Buzz.mapSomaticToAcousticDsp(baseState, baseInput);
    expect(mods.effective_pitch_semitones).toBe(0.0);
    expect(mods.effective_formant_warping).toBe(1.0);
    expect(mods.effective_breathiness_multiplier).toBe(1.0);
    expect(mods.pause_frequency_multiplier).toBe(1.0);
    expect(mods.effective_vocal_fry_density).toBe(0.0);
    expect(mods.target_lufs).toBe(-16.0);
    expect(mods.peak_dbtp).toBe(-1.0);
    expect(mods.banned_cadences).toEqual([]);
  });

  it('fails closed at T0 with VOCAL_DELIVERY_BREACH if character is unconscious', () => {
    const unconsciousState = { ...baseState, is_conscious: false };
    expect(() => Buzz.mapSomaticToAcousticDsp(unconsciousState, baseInput)).toThrow(
      /VOCAL_DELIVERY_BREACH: Actor is unconscious/,
    );
  });

  it('fails closed at T0 with VOCAL_DELIVERY_BREACH if vocal cords are transected or character is mute', () => {
    const muteState: CharacterSomaticState = {
      ...baseState,
      active_conditions: ['cnd_vocal_cord_transected'],
    };
    expect(() => Buzz.mapSomaticToAcousticDsp(muteState, baseInput)).toThrow(
      /VOCAL_DELIVERY_BREACH: Actor vocal cords are transected/,
    );
  });

  it('fails closed at T0 if speak is in banned_kinetic_verbs', () => {
    const bannedSpeakState: CharacterSomaticState = {
      ...baseState,
      banned_kinetic_verbs: ['sprint', 'speak'],
    };
    expect(() => Buzz.mapSomaticToAcousticDsp(bannedSpeakState, baseInput)).toThrow(
      /VOCAL_DELIVERY_BREACH: speak verb is in banned_kinetic_verbs/,
    );
  });

  it('applies quadratic breath dilation and locks pause multiplier to 2.8x when fatigue >= 8000 bps', () => {
    const exhaustedState: CharacterSomaticState = {
      ...baseState,
      fatigue_bps: 8200,
    };
    const mods = Buzz.mapSomaticToAcousticDsp(exhaustedState, baseInput);
    // Pi_eff = 1.0 * (1 + 1.40 * 0.82^2) = 1.0 * (1 + 1.40 * 0.6724) = 1.941
    expect(mods.effective_breathiness_multiplier).toBeGreaterThan(1.9);
    expect(mods.pause_frequency_multiplier).toBe(2.8);
    expect(mods.banned_cadences).toContain('RAPID_STACCATO');
  });

  it('collapses formant warping factor to 0.7 and drops pitch by 4 semitones under crushed larynx trauma', () => {
    const crushedLarynxState: CharacterSomaticState = {
      ...baseState,
      active_conditions: ['crushed_larynx'],
    };
    const mods = Buzz.mapSomaticToAcousticDsp(crushedLarynxState, baseInput);
    expect(mods.effective_formant_warping).toBe(0.7);
    expect(mods.effective_pitch_semitones).toBe(-4.0);
  });

  it('clamps pitch shift strictly within [-12.0, 12.0] semitones under extreme inputs', () => {
    const extremeInput: DialogueSomaticInput = {
      ...baseInput,
      base_pitch_shift_semitones: 11.5,
    };
    const painState: CharacterSomaticState = {
      ...baseState,
      pain_bps: 10000, // +3.5 st
    };
    const mods = Buzz.mapSomaticToAcousticDsp(painState, extremeInput);
    expect(mods.effective_pitch_semitones).toBe(12.0);
  });

  it('buzz translateSomaticDsp captures errors cleanly in receipt without crashing', async () => {
    const bale = {
      idx: 'test-translate',
      dat: {
        somaticState: { ...baseState, is_conscious: false },
        somaticInput: baseInput,
      },
      slv: (res: any) => res,
    };
    const updated = await Buzz.translateSomaticDsp(model, bale, null as any);
    expect(updated.lastReceipt?.ok).toBe(false);
    expect(updated.lastReceipt?.breach_reason).toContain('VOCAL_DELIVERY_BREACH');
  });
});
