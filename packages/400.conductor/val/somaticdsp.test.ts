import { describe, it, expect } from 'vitest'
import {
    mapSomaticToAcousticDsp,
    assertPhonationFeasibility,
    translateSomaticDsp,
} from '../10.somaticdsp.unit/buz/somaticdsp.buzz.js'
import { SomaticdspModel } from '../10.somaticdsp.unit/somaticdsp.model.js'
import {
    TRANSLATE_SOMATIC_LABEL,
    runSomaticTranslationMenu,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'
import type {
    CharacterSomaticState,
    DialogueSomaticInput,
} from '../10.somaticdsp.unit/fce/somaticdsp.interface.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('Feature 3.1: Somatic Basis-Point DSP Parameter Translation', () => {
    const neutralState: CharacterSomaticState = {
        character_id: 'char_elias',
        fatigue_bps: 0,
        pain_bps: 0,
        is_conscious: true,
        active_conditions: [],
        banned_kinetic_verbs: [],
    }

    const neutralInput: DialogueSomaticInput = {
        character_id: 'char_elias',
        dialogue_text: 'The perimeter is secure.',
    }

    it('asserts neutral baseline yields un-dilated broadcast DSP parameters', () => {
        const dsp = mapSomaticToAcousticDsp(neutralState, neutralInput)

        expect(dsp.basePitchShiftSemitones).toBe(0.0)
        expect(dsp.formantWarpingFactor).toBe(1.0)
        expect(dsp.breathinessPauseMultiplier).toBe(1.0)
        expect(dsp.pause_frequency_multiplier).toBe(1.0)
        expect(dsp.vocalFryDensity).toBe(0.0)
        expect(dsp.tonePacing).toBe(1.0)
        expect(dsp.target_lufs).toBe(-16.0)
        expect(dsp.peak_dbtp).toBe(-1.0)
        expect(dsp.bannedCadences).toEqual([])
    })

    it('evaluates quadratic breath dilation and locks pause multiplier for fatigue >= 8000 bps', () => {
        const exhaustedState: CharacterSomaticState = {
            character_id: 'char_pilot',
            fatigue_bps: 8400,
            pain_bps: 2000,
            is_conscious: true,
            active_conditions: [],
            banned_kinetic_verbs: [],
        }

        const dsp = mapSomaticToAcousticDsp(exhaustedState, neutralInput)

        expect(dsp.breathinessPauseMultiplier).toBeCloseTo(1.988, 2)
        expect(dsp.pause_frequency_multiplier).toBe(2.8)
        expect(dsp.bannedCadences).toContain('RAPID_STACCATO')
        expect(dsp.tonePacing).toBe(0.748)
    })

    it('collapses formant warping and drops pitch under crushed_larynx condition', () => {
        const traumaState: CharacterSomaticState = {
            character_id: 'char_injured',
            fatigue_bps: 2000,
            pain_bps: 6000,
            is_conscious: true,
            active_conditions: ['crushed_larynx'],
            banned_kinetic_verbs: [],
        }

        const dsp = mapSomaticToAcousticDsp(traumaState, neutralInput)

        expect(dsp.formantWarpingFactor).toBeLessThanOrEqual(0.7)
        expect(dsp.bannedCadences).toContain('RISING_INFLECTION_INTERROGATIVE')
        expect(dsp.basePitchShiftSemitones).toBeCloseTo(-2.3, 1)
    })

    it('fails closed with VOCAL_DELIVERY_BREACH if character is mute or unconscious', () => {
        const muteState: CharacterSomaticState = {
            character_id: 'char_mute',
            fatigue_bps: 0,
            pain_bps: 0,
            is_conscious: true,
            active_conditions: ['mute'],
            banned_kinetic_verbs: [],
        }

        expect(() => assertPhonationFeasibility(muteState)).toThrowError(
            'VOCAL_DELIVERY_BREACH',
        )

        const unconsciousState: CharacterSomaticState = {
            ...neutralState,
            is_conscious: false,
        }

        expect(() => assertPhonationFeasibility(unconsciousState)).toThrowError(
            'VOCAL_DELIVERY_BREACH',
        )

        const bannedVerbState: CharacterSomaticState = {
            ...neutralState,
            banned_kinetic_verbs: ['speak'],
        }

        expect(() => assertPhonationFeasibility(bannedVerbState)).toThrowError(
            'VOCAL_DELIVERY_BREACH',
        )
    })

    it('clamps pitch, formant, and vocal fry to strict boundary intervals', () => {
        const extremeState: CharacterSomaticState = {
            character_id: 'char_extreme',
            fatigue_bps: 10000,
            pain_bps: 10000,
            is_conscious: true,
            active_conditions: [],
            banned_kinetic_verbs: [],
        }

        const extremeInput: DialogueSomaticInput = {
            character_id: 'char_extreme',
            dialogue_text: 'Ahhh!',
            base_pitch_shift_semitones: 11.5,
            formant_warping_factor: 2.5,
            delta_formant_bps: 10000,
            base_vocal_fry: 0.8,
            vocal_fry_bps: 10000,
        }

        const dsp = mapSomaticToAcousticDsp(extremeState, extremeInput)

        expect(dsp.basePitchShiftSemitones).toBeLessThanOrEqual(12.0)
        expect(dsp.formantWarpingFactor).toBeLessThanOrEqual(2.0)
        expect(dsp.vocalFryDensity).toBe(1.0)
    })

    it('verifies 100% 7-bit clean ASCII compliance across somaticdsp unit source files', () => {
        const files = [
            'packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.interface.ts',
            'packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.bit.ts',
            'packages/400.conductor/10.somaticdsp.unit/val/somaticdsp.val.ts',
            'packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts',
            'packages/400.conductor/10.somaticdsp.unit/somaticdsp.action.ts',
            'packages/400.conductor/10.somaticdsp.unit/somaticdsp.model.ts',
            'packages/400.conductor/10.somaticdsp.unit/somaticdsp.buzzer.ts',
            'packages/400.conductor/10.somaticdsp.unit/somaticdsp.reduce.ts',
            'packages/400.conductor/val/somaticdsp.test.ts',
        ]

        for (const rel of files) {
            const full = path.resolve(process.cwd(), rel)
            if (fs.existsSync(full)) {
                const content = fs.readFileSync(full, 'utf8')
                expect(/[\u0080-\uFFFF]/.test(content)).toBe(false)
            }
        }
    })

    it('fails closed in translateSomaticDsp on missing input or VOCAL_DELIVERY_BREACH', async () => {
        const smcModel = new SomaticdspModel()
        let missingErr = ''
        await translateSomaticDsp(smcModel, {
            idx: 'test-missing',
            slv: (res: any) => {
                missingErr = res.smcBit.dat?.receipt?.error || ''
            },
        })
        expect(missingErr).toContain('TRANSLATE_ERROR')

        let breachErr = ''
        await translateSomaticDsp(smcModel, {
            idx: 'test-breach',
            dat: {
                somaticState: {
                    character_id: 'char_mute',
                    fatigue_bps: 0,
                    pain_bps: 0,
                    is_conscious: true,
                    active_conditions: ['mute'],
                    banned_kinetic_verbs: [],
                },
                somaticInput: neutralInput,
            },
            slv: (res: any) => {
                breachErr = res.smcBit.dat?.receipt?.error || ''
            },
        })
        expect(breachErr).toContain('VOCAL_DELIVERY_BREACH')
    })

    it('streams [5] TRANSLATE SOMATIC BASIS-POINT DSP telemetry to cns00 via runSomaticTranslationMenu', async () => {
        expect(TRANSLATE_SOMATIC_LABEL).toBe(
            '[5] TRANSLATE SOMATIC BASIS-POINT DSP',
        )
        const lines: string[] = []
        let resolved: any = null

        const mockState = {
            hunt: async (action: string, bale: any) => {
                if (action === '[Console action] Update Console' && bale?.src) {
                    lines.push(bale.src)
                    return {}
                }
                if (action === '[Somaticdsp action] Translate Somatic Dsp') {
                    let translated: any = null
                    await translateSomaticDsp(
                        new SomaticdspModel(),
                        {
                            ...bale,
                            slv: (r: any) => {
                                translated = r
                            },
                        },
                        mockState as any,
                    )
                    return translated
                }
                return {}
            },
        } as any

        await runSomaticTranslationMenu(
            new MenuModel(),
            {
                idx: 'test-menu-somatic',
                slv: (res: any) => {
                    resolved = res
                },
            },
            mockState,
        )

        expect(resolved?.mnuBit?.idx).toBe('run-somatic-translation-menu')
        expect(resolved?.mnuBit?.val).toBe(0)
        expect(
            lines.some((l) =>
                l.includes(
                    '[SOMATIC:INIT] Ingesting somatic meters for [char_pilot]...',
                ),
            ),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[SOMATIC:OK] [char_pilot]: Pitch=-0.98st, Formant=1.000, Breath=1.988x, Fry=0.500',
                ),
            ),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[SOMATIC:CADENCE] Extreme fatigue lock active: pause_mult=2.8x | Banned: RAPID_STACCATO',
                ),
            ),
        ).toBe(true)
        expect(
            lines.some((l) =>
                l.includes(
                    '[SOMATIC:HEADROOM] Appended target_lufs: -16.0 | peak_dbtp: -1.0',
                ),
            ),
        ).toBe(true)
    })
})
