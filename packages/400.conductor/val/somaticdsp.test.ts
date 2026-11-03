import { describe, it, expect } from 'vitest';
import sim from '../hunt.js';
import * as ActSomatic from '../10.somaticdsp.unit/somaticdsp.action.js';
import { mapSomaticToAcousticDsp } from '../10.somaticdsp.unit/buz/somaticdsp.buzz.js';

describe('packages/400.conductor 10.somaticdsp.unit Somatic Parameter DSP Translation', () => {
  it('translates neutral resting baseline parameters cleanly', () => {
    const payload = mapSomaticToAcousticDsp({
      characterId: 'char_elias',
      dialogueText: 'The relay is dead. We move now.',
      emotionalTag: 'neutral',
      basePacing: 1.0,
      meters: {
        somaticFatigueBps: 0,
        physicalPainBps: 0,
        refusalStrainBps: 0,
        paranoiaPressureBps: 0,
      },
    });

    expect(payload.character).toBe('char_elias');
    expect(payload.tonePacing).toBe(1.0);
    expect(payload.dsp_modifiers.basePitchShiftSemitones).toBe(0.0);
    expect(payload.dsp_modifiers.formantWarpingFactor).toBe(1.0);
    expect(payload.dsp_modifiers.breathinessPauseMultiplier).toBe(1.0);
    expect(payload.dsp_modifiers.pause_frequency_multiplier).toBe(1.0);
    expect(payload.dsp_modifiers.vocalFryDensity).toBe(0.0);
    expect(payload.dsp_modifiers.target_lufs).toBe(-16.0);
    expect(payload.dsp_modifiers.peak_dbtp).toBe(-1.0);
    expect(payload.dsp_modifiers.bannedCadences).toEqual([]);
  });

  it('dilates breath pauses quadratically and locks 2.8x pause multiplier on extreme fatigue (>8000 bps)', () => {
    const payload = mapSomaticToAcousticDsp({
      characterId: 'char_pilot',
      dialogueText: 'Need oxygen... valve jammed.',
      emotionalTag: 'exhausted',
      meters: {
        somaticFatigueBps: 8400,
        physicalPainBps: 2000,
      },
    });

    // Pacing drops by up to 30% (8400 / 10000 * 0.3 = 0.252 reduction -> 0.748)
    expect(payload.tonePacing).toBeCloseTo(0.748, 2);
    // Extreme fatigue locks pause frequency multiplier to at least 2.8x
    expect(payload.dsp_modifiers.pause_frequency_multiplier).toBe(2.8);
    // Quadratic breath dilation: 1.0 + 1.40 * (0.84)^2 = 1.0 + 1.40 * 0.7056 = 1.9878
    expect(payload.dsp_modifiers.breathinessPauseMultiplier).toBeCloseTo(1.99, 1);
    // Fry: 0.5 * 0.84 + 0.4 * 0.20 = 0.42 + 0.08 = 0.50
    expect(payload.dsp_modifiers.vocalFryDensity).toBeCloseTo(0.50, 2);
    expect(payload.dsp_modifiers.bannedCadences).toContain('RAPID_STACCATO');
  });

  it('collapses formant warping factor to 0.7 on crushed laryngeal cartilage trauma', () => {
    const payload = mapSomaticToAcousticDsp({
      characterId: 'char_victim',
      dialogueText: 'Cannot breathe.',
      emotionalTag: 'trauma',
      activeConditions: ['cnd_crushed_laryngeal_cartilage'],
    });

    expect(payload.dsp_modifiers.formantWarpingFactor).toBe(0.7);
    expect(payload.dsp_modifiers.basePitchShiftSemitones).toBe(-4.0);
    expect(payload.dsp_modifiers.bannedCadences).toContain('RISING_INFLECTION');
  });

  it('injects high-frequency vocal flutter and shivering pitch elevation on physiological shock', () => {
    const payload = mapSomaticToAcousticDsp({
      characterId: 'char_scout',
      dialogueText: 'Freezing cold outside.',
      emotionalTag: 'shivering',
      activeConditions: ['cnd_severe_hypothermia'],
    });

    expect(payload.dsp_modifiers.basePitchShiftSemitones).toBe(2.5);
    expect(payload.dsp_modifiers.vocalFryDensity).toBe(0.8);
    expect(payload.dsp_modifiers.bannedCadences).toContain('MONOTONE_FLAT');
  });

  it('trips VOCAL_DELIVERY_BREACH pre-flight gate at T_0 = $0.00 if entity is mute or speech verb is banned', () => {
    expect(() => {
      mapSomaticToAcousticDsp({
        characterId: 'char_mute_automaton',
        dialogueText: 'Attempting vocalization.',
        emotionalTag: 'error',
        activeConditions: ['mute'],
      });
    }).toThrow(/VOCAL_DELIVERY_BREACH/);

    expect(() => {
      mapSomaticToAcousticDsp({
        characterId: 'char_bound',
        dialogueText: 'Muffled speech.',
        emotionalTag: 'gagged',
        bannedKineticVerbs: ['speak'],
      });
    }).toThrow(/VOCAL_DELIVERY_BREACH/);
  });

  it('dispatches ActSomatic.TRANSLATE_SOMATIC_DSP cleanly through sim.hunt', async () => {
    const res = await sim.hunt!(ActSomatic.TRANSLATE_SOMATIC_DSP, {
      dat: {
        characterId: 'char_elias',
        dialogueText: 'Dispatching via sim.hunt test harness.',
        emotionalTag: 'firm',
        meters: { somaticFatigueBps: 3000 },
      },
    });

    expect(res).toBeDefined();
    expect(res.somaticdspBit.val).toBe(1);
    expect(res.somaticdspBit.src).toBe('char_elias');
    expect(res.somaticdspBit.dat.dsp_modifiers.target_lufs).toBe(-16.0);
  });
});
