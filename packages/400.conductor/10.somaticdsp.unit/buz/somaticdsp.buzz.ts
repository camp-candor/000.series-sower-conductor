import { SomaticdspModel } from '../somaticdsp.model.js'
import SomaticdspBit from '../fce/somaticdsp.bit.js'
import {
    CharacterSomaticState,
    DialogueSomaticInput,
    AcousticDspModifiers,
    SomaticDspReceipt,
    BannedCadence,
    SomaticDspInput,
    TTSGenerationPayload,
    TTSDspModifiers,
} from '../fce/somaticdsp.interface.js'
import {
    CharacterSomaticStateSchema,
    DialogueSomaticInputSchema,
} from '../val/somaticdsp.val.js'
import State from '../../99.core/state.js'

export const clamp = (val: number, min: number, max: number): number =>
    Math.min(Math.max(val, min), max)

function mapSomaticV1(input: SomaticDspInput): TTSGenerationPayload {
    const conditions = input.activeConditions || []
    const bannedVerbs = input.bannedKineticVerbs || []

    if (
        conditions.includes('mute') ||
        conditions.includes('cnd_vocal_cord_transected') ||
        bannedVerbs.includes('speak')
    ) {
        throw new Error(
            `VOCAL_DELIVERY_BREACH: Entity ${input.characterId} has physical condition preventing speech.`,
        )
    }

    const meters = {
        somaticFatigueBps: clamp(
            input.meters?.somaticFatigueBps ?? 0,
            0,
            10000,
        ),
        physicalPainBps: clamp(input.meters?.physicalPainBps ?? 0, 0, 10000),
        refusalStrainBps: clamp(input.meters?.refusalStrainBps ?? 0, 0, 10000),
        paranoiaPressureBps: clamp(
            input.meters?.paranoiaPressureBps ?? 0,
            0,
            10000,
        ),
    }

    const cadencesSet = new Set<string>()

    const basePitchShiftSemitones = 0.0
    let formantWarpingFactor = 1.0
    let baseBreathiness = 1.0
    let baseVocalFry = 0.0
    let pauseFrequencyMultiplier = 1.0
    let speedScalar = input.basePacing ?? 1.0

    if (
        conditions.includes('cnd_pulmonary_fibrosis_stage_1') ||
        conditions.includes('cnd_gas_inhalation_damage')
    ) {
        baseBreathiness = Math.max(baseBreathiness, 2.2)
        pauseFrequencyMultiplier = Math.max(pauseFrequencyMultiplier, 1.4)
        cadencesSet.add('RAPID_STACCATO')
        cadencesSet.add('UPBEAT_LILT')
    }

    if (
        conditions.includes('cnd_severe_hypothermia') ||
        conditions.includes('cnd_physiological_shock')
    ) {
        baseVocalFry = Math.max(baseVocalFry, 0.8)
        cadencesSet.add('MONOTONE_FLAT')
    }

    if (
        conditions.includes('cnd_crushed_laryngeal_cartilage') ||
        conditions.includes('crushed_larynx')
    ) {
        formantWarpingFactor = 0.7
        cadencesSet.add('RISING_INFLECTION')
    }

    if (conditions.includes('cnd_spinal_vertebral_compression')) {
        speedScalar *= 0.9
        pauseFrequencyMultiplier = Math.max(pauseFrequencyMultiplier, 1.4)
    }

    const painPitchDelta = (+3.5 * meters.physicalPainBps) / 10000
    const fatiguePitchDelta = (-2.0 * meters.somaticFatigueBps) / 10000
    const linePitchDelta = (input.pitchShiftCents ?? 0) / 100
    let laryngealPitchDelta = 0
    if (
        conditions.includes('cnd_crushed_laryngeal_cartilage') ||
        conditions.includes('crushed_larynx')
    ) {
        laryngealPitchDelta = -4.0
    }
    if (conditions.includes('cnd_severe_hypothermia')) {
        laryngealPitchDelta = +2.5
    }

    const effectivePitch = clamp(
        basePitchShiftSemitones +
            linePitchDelta +
            painPitchDelta +
            fatiguePitchDelta +
            laryngealPitchDelta,
        -12.0,
        12.0,
    )

    const effectiveFormant = clamp(formantWarpingFactor, 0.5, 2.0)

    const pacingReduction = 0.3 * (meters.somaticFatigueBps / 10000)
    const effectivePacing = clamp(
        speedScalar * (1.0 - pacingReduction),
        0.1,
        3.0,
    )

    const fatigueRatio = meters.somaticFatigueBps / 10000
    const quadraticDilation = 1.0 + 1.4 * Math.pow(fatigueRatio, 2)
    const lineBreathinessMultiplier = (input.breathinessBps ?? 10000) / 10000
    const effectiveBreathiness = clamp(
        baseBreathiness * quadraticDilation * lineBreathinessMultiplier,
        1.0,
        3.5,
    )

    if (meters.somaticFatigueBps > 8000) {
        pauseFrequencyMultiplier = Math.max(pauseFrequencyMultiplier, 2.8)
        cadencesSet.add('RAPID_STACCATO')
    }
    const effectivePauseFreq = clamp(pauseFrequencyMultiplier, 0.1, 5.0)

    const fatigueFry = 0.5 * (meters.somaticFatigueBps / 10000)
    const painFry = 0.4 * (meters.physicalPainBps / 10000)
    const lineFry = (input.vocalFryBps ?? 0) / 10000
    const effectiveFry = clamp(
        baseVocalFry + fatigueFry + painFry + lineFry,
        0.0,
        1.0,
    )

    const dspModifiers: TTSDspModifiers = {
        basePitchShiftSemitones: Number(effectivePitch.toFixed(2)),
        formantWarpingFactor: Number(effectiveFormant.toFixed(2)),
        breathinessPauseMultiplier: Number(effectiveBreathiness.toFixed(2)),
        pause_frequency_multiplier: Number(effectivePauseFreq.toFixed(2)),
        vocalFryDensity: Number(effectiveFry.toFixed(2)),
        target_lufs: -16.0,
        peak_dbtp: -1.0,
        bannedCadences: Array.from(cadencesSet).sort(),
    }

    return {
        character: input.characterId,
        text: input.dialogueText,
        emotion: input.emotionalTag,
        tonePacing: Number(effectivePacing.toFixed(3)),
        dsp_modifiers: dspModifiers,
    }
}

function mapSomaticV2(
    state: CharacterSomaticState,
    input: DialogueSomaticInput,
): AcousticDspModifiers {
    if (!state.is_conscious) {
        throw new Error('VOCAL_DELIVERY_BREACH: Actor is unconscious')
    }
    if (state.active_conditions.includes('mute')) {
        throw new Error(
            'VOCAL_DELIVERY_BREACH: Actor carries active mute condition',
        )
    }
    if (state.active_conditions.includes('cnd_vocal_cord_transected')) {
        throw new Error(
            'VOCAL_DELIVERY_BREACH: Actor vocal cords are transected',
        )
    }
    if (state.active_conditions.includes('bilateral_vocal_cord_paralysis')) {
        throw new Error(
            'VOCAL_DELIVERY_BREACH: Bilateral vocal cord paralysis present',
        )
    }
    if (state.banned_kinetic_verbs.includes('speak')) {
        throw new Error(
            'VOCAL_DELIVERY_BREACH: speak verb is in banned_kinetic_verbs',
        )
    }

    const basePitch = input.base_pitch_shift_semitones ?? 0.0
    const centsShift = (input.pitch_shift_cents ?? 0) / 100.0
    const painPitchMod = 3.5 * (state.pain_bps / 10000.0)
    const fatiguePitchMod = -2.0 * (state.fatigue_bps / 10000.0)
    let effectivePitch = basePitch + centsShift + painPitchMod + fatiguePitchMod

    if (
        state.active_conditions.includes('crushed_larynx') ||
        state.active_conditions.includes('cnd_crushed_laryngeal_cartilage')
    ) {
        effectivePitch -= 4.0
    }
    effectivePitch = clamp(effectivePitch, -12.0, 12.0)

    const baseFormant = input.formant_warping_factor ?? 1.0
    const deltaFormant = (input.delta_formant_bps ?? 0) / 10000.0
    let effectiveFormant = baseFormant * (1.0 + deltaFormant)

    if (
        state.active_conditions.includes('crushed_larynx') ||
        state.active_conditions.includes('cnd_crushed_laryngeal_cartilage')
    ) {
        effectiveFormant = Math.min(effectiveFormant, 0.7)
    }
    effectiveFormant = clamp(effectiveFormant, 0.5, 2.0)

    const baseBreath = input.base_breathiness ?? 1.0
    const fatigueRatio = state.fatigue_bps / 10000.0
    const breathMod = (input.breathiness_bps ?? 0) / 10000.0
    let effectiveBreath =
        baseBreath * (1.0 + 1.4 * Math.pow(fatigueRatio, 2)) * (1.0 + breathMod)
    effectiveBreath = clamp(effectiveBreath, 1.0, 3.5)

    let pauseMultiplier = 1.0
    if (state.fatigue_bps >= 8000) {
        pauseMultiplier = 2.8
    } else if (
        state.active_conditions.includes('punctured_lung') ||
        state.active_conditions.includes('acute_asphyxiation')
    ) {
        pauseMultiplier = 1.4
    }

    const baseFry = input.base_vocal_fry ?? 0.0
    const fryMod = (input.vocal_fry_bps ?? 0) / 10000.0
    let effectiveFry =
        baseFry + 0.5 * fatigueRatio + 0.4 * (state.pain_bps / 10000.0) + fryMod
    effectiveFry = clamp(effectiveFry, 0.0, 1.0)

    const bannedCadences: BannedCadence[] = []
    if (
        state.fatigue_bps > 5000 ||
        state.active_conditions.includes('punctured_lung')
    ) {
        bannedCadences.push('RAPID_STACCATO')
    }
    if (state.pain_bps > 4000) {
        bannedCadences.push(
            'CHEERFUL_MODULATION',
            'UPBEAT_LILT',
            'SING_SONG_RESONANCE',
        )
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
    }
}

export function mapSomaticToAcousticDsp(
    input: SomaticDspInput,
): TTSGenerationPayload
export function mapSomaticToAcousticDsp(
    state: CharacterSomaticState,
    input: DialogueSomaticInput,
): AcousticDspModifiers
export function mapSomaticToAcousticDsp(arg1: any, arg2?: any): any {
    if (
        arg2 !== undefined ||
        (arg1 &&
            'character_id' in arg1 &&
            'is_conscious' in arg1 &&
            !('dialogueText' in arg1))
    ) {
        const state: CharacterSomaticState = arg1
        const input: DialogueSomaticInput = arg2 || {
            character_id: state.character_id,
        }
        return mapSomaticV2(state, input)
    }
    return mapSomaticV1(arg1)
}

export const initSomaticdsp = (
    cpy: SomaticdspModel,
    bal: SomaticdspBit,
    ste: State,
) => {
    if (bal.slv != null) {
        bal.slv({
            smtBit: { idx: 'init-somaticdsp', val: 1 },
            somaticdspBit: { idx: 'init-somaticdsp', val: 1 },
        })
    }
    return cpy
}

export const updateSomaticdsp = (
    cpy: SomaticdspModel,
    bal: SomaticdspBit,
    ste: State,
) => {
    if (bal.slv != null) {
        bal.slv({
            smtBit: { idx: 'update-somaticdsp' },
            somaticdspBit: { idx: 'update-somaticdsp' },
        })
    }
    return cpy
}

export const translateSomaticDsp = (
    cpy: SomaticdspModel,
    bal: SomaticdspBit,
    ste: State,
) => {
    if (bal.dat?.input || (bal.dat?.characterId && bal.dat?.dialogueText)) {
        const input: SomaticDspInput = bal.dat.input || bal.dat
        try {
            const payload = mapSomaticToAcousticDsp(
                input,
            ) as TTSGenerationPayload
            cpy.totalTranslationsExecuted += 1
            cpy.lastTranslatedPayload = payload
            if (bal.slv != null) {
                bal.slv({
                    somaticdspBit: {
                        idx: 'translate-somatic-dsp-success',
                        val: 1,
                        dat: { payload },
                    },
                    smtBit: {
                        idx: 'translate-somatic-dsp-success',
                        val: 1,
                        dat: { payload },
                    },
                })
            }
        } catch (err: any) {
            const errMsg = err.message || String(err)
            if (bal.slv != null) {
                bal.slv({
                    somaticdspBit: {
                        idx: 'translate-somatic-dsp-error',
                        val: 0,
                        src: errMsg,
                    },
                    smtBit: {
                        idx: 'translate-somatic-dsp-error',
                        val: 0,
                        src: errMsg,
                    },
                })
            }
        }
        return cpy
    }

    try {
        if (!bal.dat?.somaticState || !bal.dat?.somaticInput) {
            throw new Error(
                'MISSING_PAYLOAD: somaticState and somaticInput are required',
            )
        }

        const validatedState = CharacterSomaticStateSchema.parse(
            bal.dat.somaticState,
        ) as CharacterSomaticState
        const validatedInput = DialogueSomaticInputSchema.parse(
            bal.dat.somaticInput,
        ) as DialogueSomaticInput

        cpy.characterProfiles[validatedState.character_id] = validatedState

        const modifiers = mapSomaticToAcousticDsp(
            validatedState,
            validatedInput,
        ) as AcousticDspModifiers

        const receipt: SomaticDspReceipt = {
            ok: true,
            character_id: validatedState.character_id,
            modifiers,
        }

        cpy.lastReceipt = receipt
        cpy.totalTranslationsExecuted += 1

        if (bal.slv != null) {
            bal.slv({
                smtBit: {
                    idx: 'translate-somatic-dsp-success',
                    dat: { receipt },
                },
                somaticdspBit: {
                    idx: 'translate-somatic-dsp-success',
                    dat: { receipt },
                },
            })
        }
    } catch (err: any) {
        const errorMsg = err.message || String(err)
        const receipt: SomaticDspReceipt = {
            ok: false,
            character_id:
                bal.dat?.somaticState?.character_id || 'UNKNOWN_ACTOR',
            breach_reason: errorMsg,
        }

        cpy.lastReceipt = receipt

        if (bal.slv != null) {
            bal.slv({
                smtBit: {
                    idx: 'translate-somatic-dsp-error',
                    src: errorMsg,
                    dat: { receipt },
                },
                somaticdspBit: {
                    idx: 'translate-somatic-dsp-error',
                    src: errorMsg,
                    dat: { receipt },
                },
            })
        }
    }

    return cpy
}
