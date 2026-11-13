import fs from 'node:fs'
import path from 'node:path'
import { MenuModel } from '../menu.model.js'
import MenuBit from '../fce/menu.bit.js'
import State from '../../99.core/state.js'
import * as ActMnu from '../menu.action.js'
import {
    sanitizeTo7BitAscii,
    formatTelemetryLine,
    streamConsoleTelemetry,
} from './telemetryStreamer.buzz.js'
import {
    compileParallaxSceneAst,
    discoverDraftScenePairs,
    loadActiveBibleManifest,
    matchFountainActionLinesAgainstFoleyRegistry,
    PARALLAX_DINNER_FOUNTAIN_SOURCE,
    DraftScenePair,
} from '../../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'
import { extractFountainActionLines } from '../../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'
import {
    SceneAST,
    SceneASTSchema,
} from '../../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'
import {
    compileParallaxExposureSheet,
    DEFAULT_PARALLAX_FOLEY_ACTION_LINES,
} from '../../32.audio.unit/buz/foleyMatcher.buzz.js'
import { stampStaticComposition } from '../../35.remotion.unit/buz/stampComposition.buzz.js'
import { generateUniversalProvenanceLockfile } from '../../35.remotion.unit/buz/provenance.buzz.js'
import {
    SceneShotPlan,
    CompositionMetadata,
} from '../../35.remotion.unit/fce/remotion.interface.js'
import {
    MasterSceneLifecycleContext,
    ShotLifecycleItem,
} from '../../37.lifecycle.unit/fce/masterLifecycle.interface.js'

export const CONDUCTOR_GRID_LEFT = { x: 0, y: 4, xSpan: 4, ySpan: 8 }
export const CONDUCTOR_GRID_RIGHT = { x: 4, y: 0, xSpan: 8, ySpan: 12 }

let rootSlv: any = null

export const TOOLTIP_DESCRIPTIONS: Record<string, string> = {
    'RUN MASTER SCENE LIFECYCLE (ep01_sc01)':
        'Execute atomic 8-stage pipeline from Inception Preflight to Provenance Sealing.',
    'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE':
        'Chain AST parity, speech synthesis, 24fps exposure sheet, audio-only TSX stamping, and WORM lockfile sealing.',
    'AUDIT DIALOGUE AST CONTRACT':
        'Validate drafts/dialogue_ast.json against strict Zod schema at T0 ($0.00).',
    'INSPECT CHARACTER SOMATIC DSP':
        'Convert physical fatigue and trauma metrics into continuous DSP modifiers.',
    'SYNTHESIZE SCENE AUDIO STEMS':
        'Spawn ephemeral Python synthesize.py with Zero-VRAM invariant on Rig 1.',
    'QUANTIZE ACOUSTIC MASTER CLOCK':
        'Quantize continuous WAV duration to 24 fps integer frames with zero drift.',
    'ASSEMBLE ACOUSTIC EXPOSURE SHEET':
        'Calculate -14dB sidechain ducking curve and commit drafts/exposure_sheet.json.',
    'DISPATCH REMOTE AUDIO PIVOT':
        'Programmatically trigger 000.audio-microservice via shared global pivot bus.',
    'ROOT MENU':
        'Exit Conductor flight deck and return to 995.library root cockpit.',
}

export const choices: string[] = [
    'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
    'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE',
    'AUDIT DIALOGUE AST CONTRACT',
    'INSPECT CHARACTER SOMATIC DSP',
    'SYNTHESIZE SCENE AUDIO STEMS',
    'QUANTIZE ACOUSTIC MASTER CLOCK',
    'ASSEMBLE ACOUSTIC EXPOSURE SHEET',
    'DISPATCH REMOTE AUDIO PIVOT',
    'ROOT MENU',
]

export const CONDUCTOR_MENU_CHOICES = [
    {
        id: 'CHOICE_PARALLAX_AUDIO_PIPELINE',
        label: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE',
        tooltip:
            'Chains AST Parity -> Exposure Sheet -> Audio-Only Stamping -> WORM Lockfile and emits Receipts to cns00.',
        actionType: '[Menu action] Run Parallax Dinner Pipeline',
    },
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

export const initMenu = async (
    cpy: MenuModel,
    bal: MenuBit,
    ste: State,
): Promise<MenuModel> => {
    cpy.gridLeft = CONDUCTOR_GRID_LEFT
    cpy.gridRight = CONDUCTOR_GRID_RIGHT
    cpy.menuChoices = CONDUCTOR_MENU_CHOICES

    if (bal?.slv != null) rootSlv = bal.slv

    if (!global.LIBRARY) {
        const bit = { idx: 'init-menu', val: 1 }
        if (bal?.slv != null) bal.slv({ mnuBit: bit, menuBit: bit })
        return cpy
    }

    const gridBit = await global.LIBRARY.hunt('[Grid action] Update Grid', {
        x: CONDUCTOR_GRID_RIGHT.x,
        y: CONDUCTOR_GRID_RIGHT.y,
        xSpan: CONDUCTOR_GRID_RIGHT.xSpan,
        ySpan: CONDUCTOR_GRID_RIGHT.ySpan,
    })
    await global.LIBRARY.hunt('[Write action] Write Console', {
        idx: 'cns00',
        src: '',
        dat: {
            net: gridBit?.grdBit?.dat || CONDUCTOR_GRID_RIGHT,
            src: 'alligator0',
        },
    })
    await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: '-----------',
    })
    await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: 'CONDUCTOR FLIGHT DECK',
    })
    await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: '-----------',
    })

    await updateMenu(cpy, bal, ste)
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

export const selectDraftScenePairFromCockpit = async (
    baseDir?: string,
    preselectedChoice?: string,
): Promise<DraftScenePair> => {
    const pairs = discoverDraftScenePairs(baseDir)
    const fallbackPair: DraftScenePair = pairs[0] || {
        id: 'default/parallax_dinner',
        label: 'drafts/dialogue_ast.json (Default Parallax Scene)',
        seriesSlug: 'wiregrass-basin',
        astPath: './drafts/dialogue_ast.json',
    }

    if (preselectedChoice) {
        const directMatch = pairs.find(
            (p) =>
                p.id === preselectedChoice ||
                p.label === preselectedChoice ||
                p.seriesSlug === preselectedChoice ||
                p.fountainPath === preselectedChoice ||
                p.astPath === preselectedChoice,
        )
        if (directMatch) return directMatch
    }

    if (!global.LIBRARY) {
        return fallbackPair
    }

    const lst = pairs.map((p) => p.label)
    const gridBit = await global.LIBRARY.hunt('[Grid action] Update Grid', {
        x: CONDUCTOR_GRID_LEFT.x,
        y: CONDUCTOR_GRID_LEFT.y,
        xSpan: CONDUCTOR_GRID_LEFT.xSpan,
        ySpan: CONDUCTOR_GRID_LEFT.ySpan,
    })

    const choiceBit = await global.LIBRARY.hunt('[Open action] Open Choice', {
        dat: {
            clr0: 0,
            clr1: 3,
            cb: async (focusedLabel: string) => {
                const hovered = pairs.find((p) => p.label === focusedLabel)
                if (hovered) {
                    await streamConsoleTelemetry(
                        `>> [DRAFT:SELECT] Series: ${hovered.seriesSlug} | Pair: ${hovered.label}`,
                    )
                }
            },
        },
        src: 'VERTICAL',
        lst,
        net: gridBit?.grdBit?.dat,
    })

    const selectedLabel = choiceBit?.chcBit?.src
    const matched = pairs.find(
        (p) => p.label === selectedLabel || p.id === selectedLabel,
    )
    return matched || fallbackPair
}

export const runParallaxDinnerAudioFirstPipeline = async (
    cpy: MenuModel,
    bal: MenuBit,
    _ste: State,
): Promise<MenuModel> => {
    try {
        const dat = (bal?.dat ?? {}) as Record<string, any>
        const baseDir = dat.baseDir
            ? path.resolve(String(dat.baseDir))
            : process.cwd()
        const seriesSlug = dat.seriesSlug ? String(dat.seriesSlug) : undefined

        let fountainSource = PARALLAX_DINNER_FOUNTAIN_SOURCE
        if (
            typeof dat.fountainText === 'string' &&
            dat.fountainText.trim().length > 0
        ) {
            fountainSource = dat.fountainText
        } else if (
            typeof dat.fountainPath === 'string' &&
            fs.existsSync(path.resolve(baseDir, dat.fountainPath))
        ) {
            fountainSource = fs.readFileSync(
                path.resolve(baseDir, dat.fountainPath),
                'utf8',
            )
        }

        const manifest = loadActiveBibleManifest({
            seriesSlug,
            bibleStatePath: dat.bibleStatePath,
            baseDir,
        })

        // 1. AST Parity Compilation (accepts any valid turn count >= 1 and resolves speaker cues dynamically against bible-state.json)
        const ast = compileParallaxSceneAst(fountainSource, {
            sceneId: dat.sceneId || 'ep01_sc01',
            seriesSlug: manifest.seriesSlug,
            bibleManifest: manifest,
            baseDir,
        })
        if (!ast.lines || ast.lines.length < 1) {
            throw new Error(
                `Expected at least 1 dialogue turn, got ${ast.lines?.length ?? 0}`,
            )
        }
        const turnCount = ast.lines.length
        await streamConsoleTelemetry(
            `>> [PARALLAX:AST] [OK] ${turnCount} dialogue turns verified with T0 = $0.00 verbatim parity.`,
        )

        // 2. Exposure Sheet Compilation (Clock + Foley matched against series Foley registry)
        const extractedActions = extractFountainActionLines(fountainSource).map(
            (text, idx) => ({
                text,
                frameOffset: idx * 150,
            }),
        )
        const matchedFromScript = matchFountainActionLinesAgainstFoleyRegistry(
            fountainSource,
            ast.scene_id,
            manifest.foleyRegistry,
        )
        const actionLinesForExposure =
            matchedFromScript.length > 0
                ? extractedActions
                : DEFAULT_PARALLAX_FOLEY_ACTION_LINES

        const exposureDoc = compileParallaxExposureSheet(ast.scene_id, {
            seriesId: manifest.seriesSlug,
            turnCount,
            actionLines: actionLinesForExposure,
            foleyRegistry: manifest.foleyRegistry,
            baseDir,
        })
        const foleyCount = exposureDoc.foleyPlacements?.length ?? 0
        await streamConsoleTelemetry(
            '>> [PARALLAX:CLOCK] [OK] Acoustic master clock quantized at 24.0 fps with zero drift.',
        )
        await streamConsoleTelemetry(
            `>> [PARALLAX:FOLEY] [OK] ${foleyCount} Foley cues matched with Mulberry32 + :retry1 anti-clustering (-14.0 dB ducking).`,
        )

        // 3. Audio-Only TSX Stamping
        const shots: SceneShotPlan[] = ast.lines.map((l, i) => {
            const win = exposureDoc.speechWindows?.[i] || {
                startFrame: i * 50 + 10,
                endFrame: i * 50 + 40,
            }
            return {
                shotIndex: i + 1,
                fromFrame: win.startFrame,
                durationFrames: win.endFrame - win.startFrame,
                speakerId: l.speaker_id || 'char_unknown',
                dialogueText: l.dialogue_clean_ascii || '',
                audioWavPath: `outputs/${ast.scene_id}/stems/line_${String(i + 1).padStart(3, '0')}.wav`,
                videoPlatePath: `plates/${ast.scene_id}_shot_${String(i + 1).padStart(3, '0')}.mp4`,
                bgMattePath: `mattes/${ast.scene_id}_matte_${String(i + 1).padStart(3, '0')}.png`,
            }
        })

        const foleyClips = (exposureDoc.foleyPlacements || []).map(
            (f: any, i: number) => ({
                clipId: `foley_${f.cue_name}_${i + 1}`,
                foleyPath: f.resolved_sample,
                fromFrame: f.frame_offset,
                durationInFrames: 24,
                volumeLinear: f.volume ?? 0.85,
            }),
        )

        const receipt = await stampStaticComposition(ast.scene_id, shots, {
            audioOnly: true,
            ambientLoopPath: 'music/ambient/amb_diner_rain_hum.wav',
            foleyClips,
        })
        await streamConsoleTelemetry(
            `>> [PARALLAX:BAKE] [OK] Master_${ast.scene_id}.tsx stamped (audioOnly: true, ${receipt.totalFrames} frames, ${turnCount} dialogue, ${foleyCount} Foley).`,
        )

        // 4. WORM Lockfile Sealing
        const compositionMetadata: CompositionMetadata = {
            episodeId: 'ep01',
            sceneId: ast.scene_id,
            fps: 24,
            width: 1920,
            height: 1080,
            totalDurationFrames: receipt.totalFrames,
            outputTsxPath: receipt.destinationPath,
            layers: [],
            duckingTimeline: (exposureDoc.duckingTimeline || []).map(
                (d: any) => ({
                    frame: d.frame,
                    gainDb: d.gain_db ?? d.gainDb ?? -14,
                }),
            ),
            opticalConfig: {
                halationIntensityBps: 0,
                filmGrainOpacityBps: 0,
                colorLookupTable: 'rec709',
                enableDespill: false,
            },
        }

        const lockfile = generateUniversalProvenanceLockfile({
            episodeId: 'ep01',
            sceneId: ast.scene_id,
            metadata: compositionMetadata,
        })
        await streamConsoleTelemetry(
            `>> [PARALLAX:SEALED] [OK] WORM lockfile minted at ${lockfile.lockfilePath}`,
        )

        if (bal.slv != null) {
            bal.slv({
                mnuBit: {
                    idx: 'run-parallax-dinner-audio-first-pipeline-success',
                    val: 1,
                    dat: {
                        ast,
                        exposureDoc,
                        receipt,
                        lockfilePath: lockfile.lockfilePath,
                    },
                },
            })
        }
    } catch (err: any) {
        const errMsg = formatTelemetryLine(
            'PARALLAX-PIPELINE',
            `Pipeline faulted: ${err.message}`,
            'FAIL',
        )
        await streamConsoleTelemetry(errMsg)
        if (bal.slv != null) {
            bal.slv({
                mnuBit: {
                    idx: 'run-parallax-dinner-audio-first-pipeline-error',
                    val: 0,
                    src: err.message,
                },
            })
        }
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
        if (
            bal?.src === 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE' ||
            (bal?.dat as any)?.selection ===
                'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE'
        ) {
            cpy.activeSelection = 'CHOICE_PARALLAX_AUDIO_FIRST'
            cpy.lastActionTimestamp = Date.now()
            await runParallaxDinnerAudioFirstPipeline(cpy, bal, ste)
            return cpy
        }
        const lst = (cpy.menuChoices || CONDUCTOR_MENU_CHOICES).map((c: any) =>
            typeof c === 'string' ? c : c.label,
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
                const tooltip =
                    TOOLTIP_DESCRIPTIONS[focusedLabel] ||
                    CONDUCTOR_MENU_CHOICES.find((c) => c.label === focusedLabel)
                        ?.tooltip
                if (tooltip) {
                    await streamConsoleTelemetry(`>> [TOOLTIP] ${tooltip}`)
                }
            },
        },
        src: 'VERTICAL',
        lst,
        net: gridBit?.grdBit?.dat,
    })

    const selectedLabel = choiceBit?.chcBit?.src || bal?.src

    if (
        selectedLabel === 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE' ||
        selectedLabel === 'CHOICE_PARALLAX_AUDIO_FIRST'
    ) {
        cpy.activeSelection = 'CHOICE_PARALLAX_AUDIO_FIRST'
        cpy.lastActionTimestamp = Date.now()
        await runParallaxDinnerAudioFirstPipeline(cpy, bal, ste)
        return cpy
    }

    const matchedChoice = CONDUCTOR_MENU_CHOICES.find(
        (c) => c.label === selectedLabel || c.id === selectedLabel,
    )

    if (matchedChoice) {
        cpy.activeSelection = matchedChoice.id
        cpy.lastActionTimestamp = Date.now()

        switch (matchedChoice.id) {
            case 'CHOICE_MASTER_LIFECYCLE':
                {
                    const baseDir = (bal?.dat as any)?.baseDir
                        ? path.resolve(String((bal?.dat as any).baseDir))
                        : process.cwd()
                    const selectedPair = await selectDraftScenePairFromCockpit(
                        baseDir,
                        (bal?.dat as any)?.pairChoice,
                    )
                    const manifest = loadActiveBibleManifest({
                        seriesSlug: selectedPair.seriesSlug,
                        bibleStatePath: selectedPair.bibleStatePath,
                        baseDir,
                    })

                    let compiledAst: SceneAST | null = null
                    let fountainSource: string | undefined

                    if (
                        selectedPair.fountainPath &&
                        fs.existsSync(selectedPair.fountainPath)
                    ) {
                        fountainSource = fs.readFileSync(
                            selectedPair.fountainPath,
                            'utf8',
                        )
                        compiledAst = compileParallaxSceneAst(fountainSource, {
                            sceneId: 'ep01_sc01',
                            seriesSlug: manifest.seriesSlug,
                            bibleManifest: manifest,
                            baseDir,
                        })
                    } else if (
                        selectedPair.astPath &&
                        fs.existsSync(selectedPair.astPath)
                    ) {
                        try {
                            const rawAst = JSON.parse(
                                fs.readFileSync(selectedPair.astPath, 'utf8'),
                            )
                            const parsed = SceneASTSchema.safeParse(rawAst)
                            if (parsed.success) {
                                compiledAst = parsed.data
                            }
                        } catch {
                            // Fall back to default lifecycle context
                        }
                    }

                    const foleyMatches = fountainSource
                        ? matchFountainActionLinesAgainstFoleyRegistry(
                              fountainSource,
                              compiledAst?.scene_id || 'ep01_sc01',
                              manifest.foleyRegistry,
                          )
                        : []

                    if (foleyMatches.length > 0) {
                        await streamConsoleTelemetry(
                            `>> [MENU:FOLEY] Matched ${foleyMatches.length} Foley cues from [${selectedPair.label}] against [${manifest.seriesSlug}] registry.`,
                        )
                    }

                    let lifecyclePayload: Record<string, any> = {
                        src: compiledAst?.scene_id || 'ep01_sc01',
                    }

                    if (compiledAst && compiledAst.lines.length > 0) {
                        const shots: ShotLifecycleItem[] =
                            compiledAst.lines.map((line, idx) => ({
                                shotId: `sh${String(idx + 1).padStart(2, '0')}`,
                                speakerId: line.speaker_id,
                                dialogueText: line.dialogue_clean_ascii,
                                durationMs: 2500,
                            }))
                        const lifecycleContext: MasterSceneLifecycleContext = {
                            sceneId: compiledAst.scene_id || 'ep01_sc01',
                            episodeId: 'ep01',
                            currentStage: 'STAGE_0_IDLE',
                            isDirty: false,
                            shots,
                            totalFrames: 0,
                            activeLeaseId: null,
                            activeEpoch: null,
                            stampedTsxPath: null,
                            outputDeliverablePath: null,
                            lockfileSha256: null,
                            vramUsedMb: 0,
                            t0Spend: '$0.00',
                            t4Spend: '$0.00',
                            attemptCount: 0,
                            maxAttempts: 3,
                            telemetryLogs: [],
                        }
                        lifecyclePayload = {
                            src: lifecycleContext.sceneId,
                            dat: {
                                sceneId: lifecycleContext.sceneId,
                                episodeId: 'ep01',
                                lifecycleContext,
                            },
                        }
                    }

                    const bit = await ste.hunt(
                        '[Lifecycle action] Chain Master Scene Lifecycle',
                        lifecyclePayload,
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
                {
                    const baseDir = (bal?.dat as any)?.baseDir
                        ? path.resolve(String((bal?.dat as any).baseDir))
                        : process.cwd()
                    const selectedPair = await selectDraftScenePairFromCockpit(
                        baseDir,
                        (bal?.dat as any)?.pairChoice,
                    )
                    const manifest = loadActiveBibleManifest({
                        seriesSlug: selectedPair.seriesSlug,
                        bibleStatePath: selectedPair.bibleStatePath,
                        baseDir,
                    })

                    let targetAstFilePath = './drafts/dialogue_ast.json'
                    if (
                        selectedPair.fountainPath &&
                        fs.existsSync(selectedPair.fountainPath)
                    ) {
                        const fountainRaw = fs.readFileSync(
                            selectedPair.fountainPath,
                            'utf8',
                        )
                        const targetDraftAst =
                            selectedPair.astPath ||
                            path.join(baseDir, 'drafts', 'dialogue_ast.json')
                        compileParallaxSceneAst(fountainRaw, {
                            sceneId: 'ep01_sc01',
                            seriesSlug: manifest.seriesSlug,
                            bibleManifest: manifest,
                            outputDraftPath: targetDraftAst,
                            baseDir,
                        })
                        const foleyMatches =
                            matchFountainActionLinesAgainstFoleyRegistry(
                                fountainRaw,
                                'ep01_sc01',
                                manifest.foleyRegistry,
                            )
                        await streamConsoleTelemetry(
                            `>> [MENU:AST-AUDIT] Compiled & matched ${foleyMatches.length} Foley cues for [${selectedPair.label}] (${manifest.seriesSlug}).`,
                        )
                        if (selectedPair.astPath) {
                            const rel = path
                                .relative(process.cwd(), selectedPair.astPath)
                                .replace(/\\/g, '/')
                            targetAstFilePath =
                                rel === 'drafts/dialogue_ast.json'
                                    ? './drafts/dialogue_ast.json'
                                    : rel.startsWith('.')
                                      ? rel
                                      : `./${rel}`
                        }
                    } else if (selectedPair.astPath) {
                        const rel = path
                            .relative(process.cwd(), selectedPair.astPath)
                            .replace(/\\/g, '/')
                        targetAstFilePath =
                            rel === 'drafts/dialogue_ast.json'
                                ? './drafts/dialogue_ast.json'
                                : rel.startsWith('.')
                                  ? rel
                                  : `./${rel}`
                    }

                    await ste.hunt(
                        '[Abstractsyntaxtree action] Parse Scene AST',
                        {
                            dat: { filePath: targetAstFilePath },
                        },
                    )
                }
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

            case 'CHOICE_REMOTE_AUDIO_PIVOT':
                await dispatchRemoteAudioPivot(cpy, bal, ste)
                break

            case 'CHOICE_ROOT_RETURN': {
                const slv = bal?.slv || rootSlv
                rootSlv = null
                if (slv != null) {
                    slv({ mnuBit: { idx: 'root-menu' } })
                } else if (global.LIBRARY) {
                    await global.LIBRARY.hunt('[Menu action] Open Menu', {
                        src: '',
                    })
                }
                return cpy
            }

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
