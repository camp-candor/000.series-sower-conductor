import { SomaticdspModel } from '../somaticdsp.model.js'
import type SomaticdspBit from '../fce/somaticdsp.bit.js'
import type {
    CharacterSomaticState,
    DialogueSomaticInput,
    AcousticDspModifiers,
    SomaticDspReceipt,
    SomaticDspInput,
    TTSGenerationPayload,
    TTSDspModifiers,
} from '../fce/somaticdsp.interface.js'
import type State from '../../99.core/state.js'

export const clamp = (val: number, min: number, max: number): number => {
    return Math.min(Math.max(val, min), max)
}

export const assertPhonationFeasibility = (
    state: CharacterSomaticState,
): void => {
    if (!state.is_conscious) {
        throw new Error('VOCAL_DELIVERY_BREACH: Character is unconscious')
    }

    const fatalConditions = new Set([
        'mute',
        'cnd_vocal_cord_transected',
        'bilateral_vocal_cord_paralysis',
        'acute_asphyxiation',
    ])

    for (const cond of state.active_conditions) {
        if (fatalConditions.has(cond)) {
            throw new Error(
                `VOCAL_DELIVERY_BREACH: Phonation impossible under active condition [${cond}]`,
            )
        }
    }

    if (state.banned_kinetic_verbs.includes('speak')) {
        throw new Error(
            'VOCAL_DELIVERY_BREACH: Verbal delivery forbidden by active kinetic verb ban',
        )
    }
}

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

function mapSomaticV2Core(
    state: CharacterSomaticState,
    input: DialogueSomaticInput,
): AcousticDspModifiers {
    assertPhonationFeasibility(state)

    const fatigueBps = clamp(state.fatigue_bps, 0, 10000)
    const painBps = clamp(state.pain_bps, 0, 10000)

    const basePitch = input.base_pitch_shift_semitones ?? 0.0
    const cents = input.pitch_shift_cents ?? 0
    const baseFormant = input.formant_warping_factor ?? 1.0
    const deltaFormant = input.delta_formant_bps ?? 0
    const baseBreath = input.base_breathiness ?? 1.0
    const breathBps = input.breathiness_bps ?? 0
    const baseFry = input.base_vocal_fry ?? 0.0
    const fryBps = input.vocal_fry_bps ?? 0
    const baseSpeed = input.base_speed_scalar ?? 1.0

    let pitchShift =
        basePitch +
        cents / 100.0 +
        3.5 * (painBps / 10000.0) -
        2.0 * (fatigueBps / 10000.0)
    if (state.active_conditions.includes('crushed_larynx')) {
        pitchShift -= 4.0
    }
    const effectivePitch = clamp(Number(pitchShift.toFixed(3)), -12.0, 12.0)

    let formantWarp = baseFormant * (1.0 + deltaFormant / 10000.0)
    if (state.active_conditions.includes('crushed_larynx')) {
        formantWarp = Math.min(formantWarp, 0.7)
    }
    const effectiveFormant = clamp(Number(formantWarp.toFixed(3)), 0.5, 2.0)

    const fatigueRatio = fatigueBps / 10000.0
    const breathDilation =
        baseBreath *
        (1.0 + 1.4 * Math.pow(fatigueRatio, 2)) *
        (1.0 + breathBps / 10000.0)
    const effectiveBreathiness = clamp(
        Number(breathDilation.toFixed(3)),
        1.0,
        3.5,
    )

    let pauseMultiplier = 1.0
    const bannedCadences: string[] = []

    if (fatigueBps >= 8000) {
        pauseMultiplier = 2.8
        bannedCadences.push('RAPID_STACCATO')
    } else if (fatigueBps > 5000) {
        pauseMultiplier = Number(
            (1.0 + 1.4 * (fatigueBps / 10000.0)).toFixed(3),
        )
    }

    if (state.active_conditions.includes('crushed_larynx')) {
        bannedCadences.push('RISING_INFLECTION_INTERROGATIVE')
    }

    const effectivePacing = clamp(
        Number((baseSpeed * (1.0 - 0.3 * fatigueRatio)).toFixed(3)),
        0.1,
        3.0,
    )

    const rawFry =
        baseFry +
        0.5 * fatigueRatio +
        0.4 * (painBps / 10000.0) +
        fryBps / 10000.0
    const effectiveVocalFry = clamp(Number(rawFry.toFixed(3)), 0.0, 1.0)

    return {
        basePitchShiftSemitones: effectivePitch,
        formantWarpingFactor: effectiveFormant,
        breathinessPauseMultiplier: effectiveBreathiness,
        pause_frequency_multiplier: pauseMultiplier,
        vocalFryDensity: effectiveVocalFry,
        tonePacing: effectivePacing,
        target_lufs: -16.0,
        peak_dbtp: -1.0,
        bannedCadences,
        effective_pitch_semitones: effectivePitch,
        effective_formant_warping: effectiveFormant,
        effective_breathiness_multiplier: effectiveBreathiness,
        effective_vocal_fry_density: effectiveVocalFry,
        banned_cadences: [...bannedCadences] as any,
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
        return mapSomaticV2Core(state, input)
    }
    return mapSomaticV1(arg1)
}

export const initSomaticdsp = (
    cpy: SomaticdspModel,
    bal: SomaticdspBit,
    _ste?: State,
): SomaticdspModel => {
    cpy.idx = bal.idx || '10.somaticdsp'
    if (bal.slv) {
        bal.slv({ smcBit: { idx: 'init-somaticdsp', val: 0 } })
    }
    return cpy
}

export const updateSomaticdsp = (
    cpy: SomaticdspModel,
    bal: SomaticdspBit,
    _ste?: State,
): SomaticdspModel => {
    if (bal.slv) {
        bal.slv({ smcBit: { idx: 'update-somaticdsp', val: 0 } })
    }
    return cpy
}

export const translateSomaticDsp = async (
    cpy: SomaticdspModel,
    bal: SomaticdspBit,
    ste?: State,
): Promise<SomaticdspModel> => {
    const state = bal.dat?.somaticState as CharacterSomaticState | undefined
    const input = bal.dat?.somaticInput as DialogueSomaticInput | undefined

    const emit = async (msg: string) => {
        if (ste && typeof ste.hunt === 'function') {
            await ste
                .hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
                .catch(() => {})
        } else if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: msg,
            }).catch(() => {})
        }
    }

    if (!state || !input) {
        const errorMsg = 'TRANSLATE_ERROR: Missing somaticState or somaticInput'
        await emit(`:: [SOMATIC:FAIL] ${errorMsg}`)
        if (bal.slv) {
            bal.slv({
                smcBit: {
                    idx: 'translate-somatic-dsp-fail',
                    val: -1,
                    dat: {
                        receipt: {
                            ok: false,
                            character_id:
                                (state as any)?.character_id || 'UNKNOWN',
                            dsp_modifiers: {
                                basePitchShiftSemitones: 0,
                                formantWarpingFactor: 1.0,
                                breathinessPauseMultiplier: 1.0,
                                pause_frequency_multiplier: 1.0,
                                vocalFryDensity: 0.0,
                                tonePacing: 1.0,
                                target_lufs: -16.0,
                                peak_dbtp: -1.0,
                                bannedCadences: [],
                                effective_pitch_semitones: 0,
                                effective_formant_warping: 1.0,
                                effective_breathiness_multiplier: 1.0,
                                effective_vocal_fry_density: 0.0,
                                banned_cadences: [],
                            },
                            modifiers: {
                                basePitchShiftSemitones: 0,
                                formantWarpingFactor: 1.0,
                                breathinessPauseMultiplier: 1.0,
                                pause_frequency_multiplier: 1.0,
                                vocalFryDensity: 0.0,
                                tonePacing: 1.0,
                                target_lufs: -16.0,
                                peak_dbtp: -1.0,
                                bannedCadences: [],
                                effective_pitch_semitones: 0,
                                effective_formant_warping: 1.0,
                                effective_breathiness_multiplier: 1.0,
                                effective_vocal_fry_density: 0.0,
                                banned_cadences: [],
                            },
                            error: errorMsg,
                            breach_reason: errorMsg,
                        },
                    },
                },
            })
        }
        return cpy
    }

    await emit(
        `>> [SOMATIC:INIT] Ingesting somatic meters for [${state.character_id}]...`,
    )

    try {
        const dsp = mapSomaticToAcousticDsp(state, input)

        await emit(
            `>> [SOMATIC:FEASIBILITY] Phonation checked: conscious, vocal tract clear`,
        )
        await emit(
            `>> [SOMATIC:OK] [${state.character_id}]: Pitch=${(dsp.basePitchShiftSemitones ?? 0).toFixed(2)}st, Formant=${(dsp.formantWarpingFactor ?? 1).toFixed(3)}, Breath=${(dsp.breathinessPauseMultiplier ?? 1).toFixed(3)}x, Fry=${(dsp.vocalFryDensity ?? 0).toFixed(3)}`,
        )
        if ((state.fatigue_bps ?? 0) >= 8000) {
            await emit(
                `>> [SOMATIC:CADENCE] Extreme fatigue lock active: pause_mult=2.8x | Banned: RAPID_STACCATO`,
            )
        }
        await emit(
            `>> [SOMATIC:HEADROOM] Appended target_lufs: -16.0 | peak_dbtp: -1.0`,
        )

        const receipt: SomaticDspReceipt = {
            ok: true,
            character_id: state.character_id,
            dsp_modifiers: dsp,
            modifiers: dsp,
        }

        cpy.lastReceipt = receipt
        if (cpy.characterProfiles) {
            cpy.characterProfiles[state.character_id] = state
        }
        if (typeof (cpy as any).totalTranslationsExecuted === 'number') {
            ;(cpy as any).totalTranslationsExecuted += 1
        }

        if (bal.slv) {
            bal.slv({
                smcBit: {
                    idx: 'translate-somatic-dsp-success',
                    val: 0,
                    dat: { receipt },
                },
            })
        }
    } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        await emit(`:: [SOMATIC:FAIL] [${state.character_id}]: ${errorMsg}`)

        const emptyDsp: AcousticDspModifiers = {
            basePitchShiftSemitones: 0,
            formantWarpingFactor: 1.0,
            breathinessPauseMultiplier: 1.0,
            pause_frequency_multiplier: 1.0,
            vocalFryDensity: 0.0,
            tonePacing: 1.0,
            target_lufs: -16.0,
            peak_dbtp: -1.0,
            bannedCadences: [],
            effective_pitch_semitones: 0,
            effective_formant_warping: 1.0,
            effective_breathiness_multiplier: 1.0,
            effective_vocal_fry_density: 0.0,
            banned_cadences: [],
        }

        const receipt: SomaticDspReceipt = {
            ok: false,
            character_id: state.character_id,
            dsp_modifiers: emptyDsp,
            modifiers: emptyDsp,
            error: errorMsg,
            breach_reason: errorMsg,
        }

        cpy.lastReceipt = receipt

        if (bal.slv) {
            bal.slv({
                smcBit: {
                    idx: 'translate-somatic-dsp-fail',
                    val: -1,
                    dat: { receipt },
                },
            })
        }
    }

    return cpy
}
