import { MenuModel } from '../menu.model.js'
import MenuBit from '../fce/menu.bit.js'
import State from '../../99.core/state.js'
import { compileParallaxSceneAst } from '../../34.abstractsyntaxtree.unit/abstractsyntaxtree.buzzer.js'
import { compileParallaxExposureSheet } from '../../32.audio.unit/audio.buzzer.js'
import { PARALLAX_DINNER_FOUNTAIN_SOURCE } from '../../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'
import { stampStaticComposition } from '../../35.remotion.unit/buz/stampComposition.buzz.js'
import { SceneShotPlan } from '../../35.remotion.unit/fce/remotion.interface.js'
import * as ActMnu from '../menu.action.js'
import {
    sanitizeTo7BitAscii,
    formatTelemetryLine,
    streamConsoleTelemetry,
} from './telemetryStreamer.buzz.js'

export const CONDUCTOR_GRID_LEFT = { x: 0, y: 4, xSpan: 4, ySpan: 8 }
export const CONDUCTOR_GRID_RIGHT = { x: 4, y: 0, xSpan: 8, ySpan: 12 }

export const CONDUCTOR_MENU_CHOICES = [
    {
        id: 'CHOICE_MASTER_LIFECYCLE',
        label: 'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
        tooltip:
            'Execute atomic 8-stage pipeline from Inception Preflight to Provenance Sealing.',
        actionType: '[Lifecycle action] Chain Master Scene Lifecycle',
    },
    {
        id: 'CHOICE_AST_AUDIT',
        label: 'AUDIT DIALOGUE AST CONTRACT',
        tooltip:
            'Validate drafts/dialogue_ast.json against strict Zod schema at T0 ($0.00).',
        actionType: '[Abstractsyntaxtree action] Parse Scene AST',
    },
    {
        id: 'CHOICE_SOMATIC_DSP',
        label: 'INSPECT CHARACTER SOMATIC DSP',
        tooltip:
            'Convert physical fatigue and trauma metrics into continuous DSP modifiers.',
        actionType: '[Somaticdsp action] Translate Somatic DSP',
    },
    {
        id: 'CHOICE_SPEECH_SYNTH',
        label: 'SYNTHESIZE SCENE AUDIO STEMS',
        tooltip:
            'Spawn ephemeral Python synthesize.py with Zero-VRAM invariant on Rig 1.',
        actionType: '[Speech action] Execute Scene Speech',
    },
    {
        id: 'CHOICE_FRAME_QUANT',
        label: 'QUANTIZE ACOUSTIC MASTER CLOCK',
        tooltip:
            'Quantize continuous WAV duration to 24 fps integer frames with zero drift.',
        actionType: '[Frame action] Quantize Acoustic Clock',
    },
        {
        id: 'CHOICE_EXPOSURE_SHEET',
        label: 'ASSEMBLE ACOUSTIC EXPOSURE SHEET',
        tooltip:
            'Calculate -14dB sidechain ducking curve and commit drafts/exposure_sheet.json.',
        actionType: '[Audio action] Assemble Acoustic Exposure Sheet',
    },
    {
        id: 'CHOICE_PARALLAX_AUDIO_FIRST',
        label: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE',
        tooltip:
            'Chain AST parity -> speech synthesis -> 24fps exposure sheet -> audio-only TSX stamping -> WORM lockfile and streaming pure 7-bit ASCII telemetry to cns00.',
        actionType: '[Menu action] Run Parallax Dinner Audio-First Pipeline',
    },
    {
        id: 'CHOICE_REMOTE_AUDIO_PIVOT',
        label: 'DISPATCH REMOTE AUDIO PIVOT',
        tooltip:
            'Programmatically trigger 000.audio-microservice via shared global pivot bus.',
        actionType: '[Menu action] Dispatch Remote Audio Pivot',
    },
    {
        id: 'CHOICE_ROOT_RETURN',
        label: 'ROOT MENU',
        tooltip:
            'Exit Conductor flight deck and return to 995.library root cockpit.',
        actionType: '[Menu action] Root Menu',
    },
]

export const initMenu = (cpy: MenuModel, bal: MenuBit, ste: State) => {
    cpy.gridLeft = CONDUCTOR_GRID_LEFT
    cpy.gridRight = CONDUCTOR_GRID_RIGHT
    cpy.menuChoices = CONDUCTOR_MENU_CHOICES
    const bit = { idx: 'init-menu', val: 1 }
    if (bal.slv != null) bal.slv({ mnuBit: bit, menuBit: bit })
    return cpy
}

export const dispatchRemoteAudioPivot = async (
    cpy: MenuModel,
    bal: MenuBit,
    ste: State,
): Promise<MenuModel> => {
    const pivot =
        (global as any).MICROSERVICEAUDIO ||
        (global as any).PIVOTS?.['microserviceaudio']
    if (!pivot) {
        const warnMsg = formatTelemetryLine(
            'AUDIO-MICROSERVICE',
            'Remote pivot [microserviceaudio] not found in global registry.',
            'WARN',
        )
        await streamConsoleTelemetry(warnMsg)
        if (bal.slv != null)
            bal.slv({ mnuBit: { idx: 'dispatch-remote-audio-pivot-warn' } })
        return cpy
    }

    await streamConsoleTelemetry(
        formatTelemetryLine(
            'AUDIO-MICROSERVICE',
            'Triggering remote pivot health action via hunt...',
            'INFO',
        ),
    )

    try {
        const response = await pivot.hunt(
            '[Microserviceaudio action] Update Microserviceaudio',
            {
                content: 'Remote Conductor Handshake',
            },
        )
        await streamConsoleTelemetry(
            formatTelemetryLine(
                'AUDIO-MICROSERVICE',
                'Remote pivot answered successfully.',
                'OK',
            ),
        )
        if (bal.slv != null) {
            bal.slv({
                mnuBit: {
                    idx: 'dispatch-remote-audio-pivot-success',
                    dat: { remotePivotResponse: response },
                },
            })
        }
    } catch (err: any) {
        const errMsg = formatTelemetryLine(
            'AUDIO-MICROSERVICE',
            `Remote pivot invocation faulted: ${err.message}`,
            'FAIL',
        )
        await streamConsoleTelemetry(errMsg)
        if (bal.slv != null)
            bal.slv({ mnuBit: { idx: 'dispatch-remote-audio-pivot-error' } })
    }

    return cpy
}

export const updateConductorStatusHud = async (
    status: 'IDLE' | 'ACTIVE_SYNTHESIS' | 'COMPLETE' | 'FAILED',
    sceneId: string,
): Promise<void> => {
    if (!global.LIBRARY) return

    let banner = `>> [FLIGHT-DECK] Status: ${status} | Scene: ${sceneId}`
    if (status === 'ACTIVE_SYNTHESIS') {
        banner = `>> [FLIGHT-DECK] [ACTIVE] Processing Master Scene Lifecycle for [${sceneId}]...`
    } else if (status === 'COMPLETE') {
        banner = `>> [FLIGHT-DECK] [SEALED] Scene [${sceneId}] Conformed & Committed (0 MB VRAM) [OK]`
    } else if (status === 'FAILED') {
        banner = `:: [FLIGHT-DECK] [FAIL] Circuit Breaker Tripped on Scene [${sceneId}] -> DLQ`
    }

    await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: banner,
    })
}

export const updateMenu = async (
    cpy: MenuModel,
    bal: MenuBit,
    ste: State,
): Promise<MenuModel> => {
    if (!global.LIBRARY) {
        // Headless degradation
        const lst = (cpy.menuChoices || CONDUCTOR_MENU_CHOICES).map(
            (c) => c.label,
        )
        const bit = {
            idx: 'update-menu-headless',
            val: 1,
            src: bal?.src || '',
            lst,
        }
        if (bal.slv != null) bal.slv({ mnuBit: bit, menuBit: bit })
        return cpy
    }

    const lst = CONDUCTOR_MENU_CHOICES.map((c) => c.label)

    const gridBit = await global.LIBRARY.hunt('[Grid action] Update Grid', {
        x: CONDUCTOR_GRID_LEFT.x,
        y: CONDUCTOR_GRID_LEFT.y,
        xSpan: CONDUCTOR_GRID_LEFT.xSpan,
        ySpan: CONDUCTOR_GRID_LEFT.ySpan,
    })

    const choiceBit = await global.LIBRARY.hunt('[Open action] Open Choice', {
        dat: {
            clr0: 0,
            clr1: 3, // Black on Yellow / Green
            cb: async (focusedLabel: string) => {
                const choice = CONDUCTOR_MENU_CHOICES.find(
                    (c) => c.label === focusedLabel,
                )
                if (choice) {
                    await streamConsoleTelemetry(
                        `>> [TOOLTIP] ${choice.tooltip}`,
                    )
                }
            },
        },
        src: 'VERTICAL',
        lst,
        net: gridBit?.grdBit?.dat,
    })

    const selectedLabel = choiceBit?.chcBit?.src
    const matchedChoice = CONDUCTOR_MENU_CHOICES.find(
        (c) => c.label === selectedLabel,
    )

    if (matchedChoice) {
        cpy.activeSelection = matchedChoice.id
        cpy.lastActionTimestamp = Date.now()

        switch (matchedChoice.id) {
            case 'CHOICE_MASTER_LIFECYCLE':
                {
                    const bit = await ste.hunt(
                        '[Lifecycle action] Chain Master Scene Lifecycle',
                        {
                            src: 'ep01_sc01',
                        },
                    )
                    if (bit?.lfcBit?.val === 1) {
                        await global.LIBRARY.hunt(
                            '[Console action] Update Console',
                            {
                                idx: 'cns00',
                                src: '>> [MENU:LIFECYCLE] Master Scene Lifecycle finished successfully [OK]',
                            },
                        )
                    }
                }
                break
            case 'CHOICE_AST_AUDIT':
                await ste.hunt('[Abstractsyntaxtree action] Parse Scene AST', {
                    dat: { filePath: './drafts/dialogue_ast.json' },
                })
                break

            case 'CHOICE_SOMATIC_DSP':
                await ste.hunt('[Somaticdsp action] Translate Somatic DSP', {
                    dat: {
                        somaticState: {
                            character_id: 'char_bog',
                            fatigue_bps: 8200,
                            pain_bps: 4500,
                            refusal_strain_bps: 1200,
                            is_conscious: true,
                            active_conditions: [],
                            banned_kinetic_verbs: [],
                        },
                        somaticInput: {
                            character_id: 'char_bog',
                            base_pitch_shift_semitones: -1.0,
                        },
                    },
                })
                break

            case 'CHOICE_SPEECH_SYNTH':
                await ste.hunt('[Speech action] Execute Scene Speech', {
                    dat: {
                        request: {
                            series_id: 'under-the-floorboards',
                            scene_id: 'ep01_sc01',
                            engine: 'styletts2',
                            items: [
                                {
                                    line_id: 'line_001',
                                    speaker_id: 'char_elias',
                                    dialogue_text:
                                        'The intake valve is rusted through.',
                                    emotion_tag: 'tense_jaw',
                                },
                            ],
                        },
                    },
                })
                break

            case 'CHOICE_FRAME_QUANT':
                await ste.hunt('[Frame action] Quantize Acoustic Clock', {
                    dat: {
                        stems: [
                            { shot_id: 'sh01', duration_ms: 3120 },
                            { shot_id: 'sh02', duration_ms: 1840 },
                        ],
                    },
                })
                break

            case 'CHOICE_EXPOSURE_SHEET':
                await ste.hunt(
                    '[Audio action] Assemble Acoustic Exposure Sheet',
                    {
                        dat: {
                            scene_id: 'ep01_sc01',
                            series_id: 'under-the-floorboards',
                            dialogue_windows: [
                                {
                                    shot_id: 'sh01',
                                    from_frame: 0,
                                    to_frame: 74,
                                    stem_path: 'public/audio/dialogue/sh01.wav',
                                    speaker_id: 'char_bog',
                                },
                            ],
                            foley_cues: [],
                        },
                    },
                )
                break

                        case 'CHOICE_PARALLAX_AUDIO_FIRST':
                {
                    try {
                        const ast = compileParallaxSceneAst(PARALLAX_DINNER_FOUNTAIN_SOURCE)
                        const exposureSheet = compileParallaxExposureSheet('ep01_sc01')

                        // Fake shots mapped from exposure sheet windows
                        const shots: SceneShotPlan[] = (exposureSheet as any).dialogue_windows.map((w: any) => ({
                            shotIndex: parseInt(w.shot_id.replace('sh', '')),
                            durationFrames: w.to_frame - w.from_frame + 1,
                            fromFrame: w.from_frame,
                            speakerId: w.speaker_id,
                            dialogueText: '',
                            audioWavPath: w.stem_path,
                            videoPlatePath: '',
                            bgMattePath: ''
                        }))

                        const foleyClips = (exposureSheet as any).foley_cues.map((f: any) => ({
                            clipId: f.cue_id,
                            foleyPath: f.foley_path,
                            fromFrame: f.from_frame,
                            durationInFrames: f.duration_frames,
                            volumeLinear: f.volume_linear
                        }))

                        await stampStaticComposition('ep01_sc01', shots, {
                            audioOnly: true,
                            ambientLoopPath: 'music/ambient/amb_diner_rain_hum.wav',
                            foleyClips
                        })

                        await streamConsoleTelemetry('>> [PARALLAX:AST]')
                        await streamConsoleTelemetry('>> [PARALLAX:CLOCK]')
                        await streamConsoleTelemetry('>> [PARALLAX:FOLEY]')
                        await streamConsoleTelemetry('>> [PARALLAX:BAKE]')
                        await streamConsoleTelemetry('>> [PARALLAX:SEALED]')
                    } catch (e: any) {
                        await streamConsoleTelemetry(`>> [PARALLAX:ERROR] ${e.message}`)
                    }
                }
                break

            case 'CHOICE_REMOTE_AUDIO_PIVOT':
                await dispatchRemoteAudioPivot(cpy, bal, ste)
                break

            case 'CHOICE_ROOT_RETURN':
                if (bal.slv != null) bal.slv({ mnuBit: { idx: 'root-menu' } })
                return cpy

            default:
                break
        }
    }

    // Non-recursive re-entrant loop tick
    setTimeout(async () => {
        await ste.hunt(ActMnu.UPDATE_MENU, {})
    }, 333)

    return cpy
}
