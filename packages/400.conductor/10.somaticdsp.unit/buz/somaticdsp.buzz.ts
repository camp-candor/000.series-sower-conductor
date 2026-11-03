import { SomaticdspModel } from '../somaticdsp.model.js';
import SomaticdspBit from '../fce/somaticdsp.bit.js';
import State from '../../99.core/state.js';
import {
  SomaticDspInput,
  TTSGenerationPayload,
  TTSDspModifiers,
} from '../fce/somaticdsp.interface.js';

export function clamp(val: number, min: number, max: number): number {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

export function mapSomaticToAcousticDsp(input: SomaticDspInput): TTSGenerationPayload {
  const conditions = input.activeConditions || [];
  const bannedVerbs = input.bannedKineticVerbs || [];

  // Feasibility Assertion: Cannot speak if mute or speak verb is banned
  if (conditions.includes('mute') || conditions.includes('cnd_vocal_cord_transected') || bannedVerbs.includes('speak')) {
    throw new Error(`VOCAL_DELIVERY_BREACH: Entity ${input.characterId} has physical condition preventing speech.`);
  }

  const meters = {
    somaticFatigueBps: clamp(input.meters?.somaticFatigueBps ?? 0, 0, 10000),
    physicalPainBps: clamp(input.meters?.physicalPainBps ?? 0, 0, 10000),
    refusalStrainBps: clamp(input.meters?.refusalStrainBps ?? 0, 0, 10000),
    paranoiaPressureBps: clamp(input.meters?.paranoiaPressureBps ?? 0, 0, 10000),
  };

  const cadencesSet = new Set<string>();

  // Baseline voice constants
  const basePitchShiftSemitones = 0.0;
  let formantWarpingFactor = 1.0;
  let baseBreathiness = 1.0;
  let baseVocalFry = 0.0;
  let pauseFrequencyMultiplier = 1.0;
  let speedScalar = input.basePacing ?? 1.0;

  // 1. Biological Condition Mapping
  if (conditions.includes('cnd_pulmonary_fibrosis_stage_1') || conditions.includes('cnd_gas_inhalation_damage')) {
    baseBreathiness = Math.max(baseBreathiness, 2.2);
    pauseFrequencyMultiplier = Math.max(pauseFrequencyMultiplier, 1.4);
    cadencesSet.add('RAPID_STACCATO');
    cadencesSet.add('UPBEAT_LILT');
  }

  if (conditions.includes('cnd_severe_hypothermia') || conditions.includes('cnd_physiological_shock')) {
    baseVocalFry = Math.max(baseVocalFry, 0.8);
    cadencesSet.add('MONOTONE_FLAT');
  }

  if (conditions.includes('cnd_crushed_laryngeal_cartilage')) {
    formantWarpingFactor = 0.7;
    cadencesSet.add('RISING_INFLECTION');
  }

  if (conditions.includes('cnd_spinal_vertebral_compression')) {
    speedScalar *= 0.90;
    pauseFrequencyMultiplier = Math.max(pauseFrequencyMultiplier, 1.4);
  }

  // 2. Fundamental Frequency Tremor Modulation (Semitones)
  // Acute pain elevates pitch; fatigue creates low-register drone
  const painPitchDelta = (+3.5 * meters.physicalPainBps) / 10000;
  const fatiguePitchDelta = (-2.0 * meters.somaticFatigueBps) / 10000;
  const linePitchDelta = (input.pitchShiftCents ?? 0) / 100;
  let laryngealPitchDelta = 0;
  if (conditions.includes('cnd_crushed_laryngeal_cartilage')) {
    laryngealPitchDelta = -4.0;
  }
  if (conditions.includes('cnd_severe_hypothermia')) {
    laryngealPitchDelta = +2.5;
  }

  const effectivePitch = clamp(
    basePitchShiftSemitones + linePitchDelta + painPitchDelta + fatiguePitchDelta + laryngealPitchDelta,
    -12.0,
    12.0
  );

  // 3. Formant Warping Factor
  const effectiveFormant = clamp(formantWarpingFactor, 0.5, 2.0);

  // 4. Pacing Velocity
  const pacingReduction = 0.30 * (meters.somaticFatigueBps / 10000);
  const effectivePacing = clamp(speedScalar * (1.0 - pacingReduction), 0.1, 3.0);

  // 5. Breath Interval Dilation (Quadratic Curve)
  const fatigueRatio = meters.somaticFatigueBps / 10000;
  const quadraticDilation = 1.0 + 1.40 * Math.pow(fatigueRatio, 2);
  const lineBreathinessMultiplier = (input.breathinessBps ?? 10000) / 10000;
  const effectiveBreathiness = clamp(baseBreathiness * quadraticDilation * lineBreathinessMultiplier, 1.0, 3.5);

  // 6. Pause Frequency & Exhaustion Strain
  if (meters.somaticFatigueBps > 8000) {
    pauseFrequencyMultiplier = Math.max(pauseFrequencyMultiplier, 2.8);
    cadencesSet.add('RAPID_STACCATO');
  }
  const effectivePauseFreq = clamp(pauseFrequencyMultiplier, 0.1, 5.0);

  // 7. Subharmonic Vocal Fry
  const fatigueFry = 0.50 * (meters.somaticFatigueBps / 10000);
  const painFry = 0.40 * (meters.physicalPainBps / 10000);
  const lineFry = (input.vocalFryBps ?? 0) / 10000;
  const effectiveFry = clamp(baseVocalFry + fatigueFry + painFry + lineFry, 0.0, 1.0);

  const dspModifiers: TTSDspModifiers = {
    basePitchShiftSemitones: Number(effectivePitch.toFixed(2)),
    formantWarpingFactor: Number(effectiveFormant.toFixed(2)),
    breathinessPauseMultiplier: Number(effectiveBreathiness.toFixed(2)),
    pause_frequency_multiplier: Number(effectivePauseFreq.toFixed(2)),
    vocalFryDensity: Number(effectiveFry.toFixed(2)),
    target_lufs: -16.0,
    peak_dbtp: -1.0,
    bannedCadences: Array.from(cadencesSet).sort(),
  };

  return {
    character: input.characterId,
    text: input.dialogueText,
    emotion: input.emotionalTag,
    tonePacing: Number(effectivePacing.toFixed(3)),
    dsp_modifiers: dspModifiers,
  };
}

export const initSomaticdsp = (cpy: SomaticdspModel, bal: SomaticdspBit, _ste: State) => {
  if (bal.slv) bal.slv({ somaticdspBit: { idx: 'init-somaticdsp', val: 1 } });
  return cpy;
};

export const translateSomaticDsp = (cpy: SomaticdspModel, bal: SomaticdspBit, _ste: State) => {
  const cns = '>> [SOMATIC-DSP]';
  const input = bal.dat as SomaticDspInput;

  if (!input || !input.characterId || !input.dialogueText) {
    const err = 'TRANSLATION_REJECTED: Missing characterId or dialogueText';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ somaticdspBit: { idx: 'translate-somatic-dsp-error', val: 0, src: err } });
    throw new Error(err);
  }

  try {
    const payload = mapSomaticToAcousticDsp(input);
    cpy.totalTranslationsExecuted += 1;
    cpy.lastTranslatedPayload = payload;

    process.stdout.write(
      `${cns} [OK] Translated somatic vector for ${payload.character} (Pitch: ${payload.dsp_modifiers.basePitchShiftSemitones}st, Formant: ${payload.dsp_modifiers.formantWarpingFactor}, Pause: ${payload.dsp_modifiers.pause_frequency_multiplier}x)\n`
    );

    if (bal.slv) {
      bal.slv({
        somaticdspBit: {
          idx: 'translate-somatic-dsp',
          val: 1,
          src: payload.character,
          dat: payload,
        },
      });
    }
  } catch (err: any) {
    process.stderr.write(`${cns} [FAIL] ${err.message}\n`);
    if (bal.slv) {
      bal.slv({
        somaticdspBit: {
          idx: 'translate-somatic-dsp-error',
          val: 0,
          src: err.message,
        },
      });
    } else {
      throw err;
    }
  }

  return cpy;
};

