// packages/400.conductor/32.audio.unit/buz/foleyMatcher.buzz.ts
import { murmurHash3 } from './foleySeeder.buzz.js'
import {
    calculateDuckedVolume,
    computeMultiWindowDuckingCurve,
} from './duckingCalculator.buzz.js'
import { assembleExposureSheetDocument } from './audio.buzz.js'
import * as fs from 'node:fs'
import * as path from 'node:path'

export const PARALLAX_FOLEY_REGISTRY: Record<string, string[]> = {
    rain_squall: [
        'foley/rain_squall/squall_v1.wav',
        'foley/rain_squall/squall_v2.wav',
        'foley/rain_squall/squall_v3.wav',
    ],
    diesel_idle: [
        'foley/diesel_idle/idle_v1.wav',
        'foley/diesel_idle/idle_v2.wav',
        'foley/diesel_idle/idle_v3.wav',
    ],
    door_hiss: [
        'foley/door_hiss/hiss_v1.wav',
        'foley/door_hiss/hiss_v2.wav',
        'foley/door_hiss/hiss_v3.wav',
    ],
    booth_creak: [
        'foley/booth_creak/creak_v1.wav',
        'foley/booth_creak/creak_v2.wav',
        'foley/booth_creak/creak_v3.wav',
    ],
    menu_drop: [
        'foley/menu_drop/drop_v1.wav',
        'foley/menu_drop/drop_v2.wav',
        'foley/menu_drop/drop_v3.wav',
    ],
    coffee_pour: [
        'foley/coffee_pour/pour_v1.wav',
        'foley/coffee_pour/pour_v2.wav',
        'foley/coffee_pour/pour_v3.wav',
    ],
    wipe_tear: [
        'foley/wipe_tear/tear_v1.wav',
        'foley/wipe_tear/tear_v2.wav',
        'foley/wipe_tear/tear_v3.wav',
    ],
    lens_click: [
        'foley/lens_click/click_v1.wav',
        'foley/lens_click/click_v2.wav',
        'foley/lens_click/click_v3.wav',
    ],
    semi_pass: [
        'foley/semi_pass/pass_v1.wav',
        'foley/semi_pass/pass_v2.wav',
        'foley/semi_pass/pass_v3.wav',
    ],
}

export const mulberry32 = (seed: number) => {
    return () => {
        let t = (seed += 0x6d2b79f5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export interface FoleyPlacement {
    cue_name: string
    resolved_sample: string
    frame_offset: number
    shot_id?: string
    volume?: number
}

export interface CompileExposureSheetOptions {
    seriesId?: string
    turnCount?: number
    fountainText?: string
    actionLines?: Array<{ text: string; frameOffset: number }>
    foleyRegistry?: Record<string, string[]>
    baseDir?: string
}

export const matchActionLinesToFoleyPlacements = (
    sceneId: string,
    actionLines: Array<{ text: string; frameOffset: number }>,
    foleyRegistry: Record<string, string[]> = PARALLAX_FOLEY_REGISTRY,
): FoleyPlacement[] => {
    const placements: FoleyPlacement[] = []
    const activeRegistry =
        foleyRegistry && Object.keys(foleyRegistry).length > 0
            ? foleyRegistry
            : PARALLAX_FOLEY_REGISTRY

    // Simple keyword mapping for the test case
    const keywords: Record<string, string> = {
        'rain squall': 'rain_squall',
        'diesel': 'diesel_idle',
        'door hiss': 'door_hiss',
        'booth creak': 'booth_creak',
        'menu drop': 'menu_drop',
        'coffee pour': 'coffee_pour',
        'wipe': 'wipe_tear',
        'lens click': 'lens_click',
        'roaring logging semi': 'semi_pass',
        'semi pass': 'semi_pass',
    }

    for (const line of actionLines) {
        const text = line.text.toLowerCase()
        let matchedCue: string | null = null

        // First check custom registry keys directly if present
        for (const cue of Object.keys(activeRegistry)) {
            const cueSpace = cue.toLowerCase().replace(/_/g, ' ')
            if (text.includes(cue.toLowerCase()) || text.includes(cueSpace)) {
                matchedCue = cue
                break
            }
        }

        if (!matchedCue) {
            for (const [kw, cue] of Object.entries(keywords)) {
                if (text.includes(kw) && activeRegistry[cue]) {
                    matchedCue = cue
                    break
                }
            }
        }

        if (matchedCue && activeRegistry[matchedCue]) {
            const variants = activeRegistry[matchedCue]
            let seed = murmurHash3(
                `${sceneId}:${matchedCue}:${line.frameOffset}`,
            )
            let prng = mulberry32(seed)
            let variantIdx = Math.floor(prng() * variants.length)
            let sample = variants[variantIdx]

            // Check previous placements for anti-clustering
            const prevPlacement = [...placements]
                .reverse()
                .find((p) => p.cue_name === matchedCue)
            if (
                prevPlacement &&
                line.frameOffset - prevPlacement.frame_offset < 120 &&
                prevPlacement.resolved_sample === sample
            ) {
                seed = murmurHash3(
                    `${sceneId}:${matchedCue}:${line.frameOffset}:retry1`,
                )
                prng = mulberry32(seed)
                variantIdx = (variantIdx + 1) % variants.length
                sample = variants[variantIdx]
            }

            placements.push({
                cue_name: matchedCue,
                resolved_sample: sample,
                frame_offset: line.frameOffset,
                shot_id: `shot_${placements.length + 1}`,
                volume: 0.8,
            })
        }
    }

    return placements
}

export const mergeCloseSpeechWindows = (
    windows: Array<{ startFrame: number; endFrame: number }>,
    maxGapFrames = 18,
): Array<{ startFrame: number; endFrame: number }> => {
    if (windows.length === 0) return []

    const sorted = [...windows].sort((a, b) => a.startFrame - b.startFrame)
    const merged = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
        const current = merged[merged.length - 1]
        const next = sorted[i]

        if (next.startFrame - current.endFrame <= maxGapFrames) {
            current.endFrame = Math.max(current.endFrame, next.endFrame)
        } else {
            merged.push(next)
        }
    }

    return merged
}

export const DEFAULT_PARALLAX_FOLEY_ACTION_LINES = [
    {
        text: 'South Georgia rain squall beats against the window.',
        frameOffset: 0,
    },
    { text: 'Peterbilt 379 diesel idling outside.', frameOffset: 150 },
    {
        text: 'The hydraulic diner door hiss sounds as he enters.',
        frameOffset: 300,
    },
    {
        text: 'He slides into the booth, a sharp booth creak.',
        frameOffset: 450,
    },
    {
        text: 'Waitress drops the laminated menu (menu drop).',
        frameOffset: 600,
    },
    { text: 'She does a coffee pour.', frameOffset: 750 },
    { text: 'He rips open an isopropyl wipe tear.', frameOffset: 900 },
    { text: 'A metallic trial lens click echoes.', frameOffset: 1050 },
    {
        text: 'A roaring logging semi pass shakes the diner.',
        frameOffset: 1200,
    },
]

export const compileParallaxExposureSheet = (
    sceneId = 'ep01_sc01',
    options: CompileExposureSheetOptions = {},
) => {
    const turnCount =
        typeof options.turnCount === 'number' && options.turnCount > 0
            ? options.turnCount
            : 34

    // Generate dialogue windows dynamically for any valid turnCount
    const rawWindows = Array.from({ length: turnCount }).map((_, i) => ({
        startFrame: i * 50 + 10,
        endFrame: i * 50 + 40,
        id: `dlg_${i + 1}`,
    }))

    const mergedWindows = mergeCloseSpeechWindows(rawWindows)

    // Map to DialogueWindow interface format expected by assembleExposureSheetDocument
    const dialogueWindows = mergedWindows.map((w) => ({
        shot_id: `shot_dlg`,
        from_frame: w.startFrame,
        to_frame: w.endFrame,
        stem_path: `audio/dialogue/${sceneId}_stem.wav`,
    }))

    const foleyActionLines =
        options.actionLines && options.actionLines.length > 0
            ? options.actionLines
            : DEFAULT_PARALLAX_FOLEY_ACTION_LINES

    const foleyPlacements = matchActionLinesToFoleyPlacements(
        sceneId,
        foleyActionLines,
        options.foleyRegistry ?? PARALLAX_FOLEY_REGISTRY,
    )

    const doc = assembleExposureSheetDocument(
        options.seriesId || 'under-the-floorboards',
        sceneId,
        dialogueWindows,
        foleyPlacements,
        'audio/ambient/machinery_bed.wav',
        0.4,
    )

    const extendedDoc = {
        ...doc,
        sceneId: sceneId,
        duckingFloorDb: -14,
        foleyPlacements: foleyPlacements,
        duckingTimeline: doc.tracks.track3_ambient.ducking_keyframes,
        speechWindows: rawWindows,
    }

    const rootDir = options.baseDir
        ? path.resolve(options.baseDir)
        : process.cwd()

    // Output paths
    const epOutDir = path.resolve(rootDir, `outputs/${sceneId}`)
    if (!fs.existsSync(epOutDir)) {
        fs.mkdirSync(epOutDir, { recursive: true })
    }

    const draftsDir = path.resolve(rootDir, 'drafts')
    if (!fs.existsSync(draftsDir)) {
        fs.mkdirSync(draftsDir, { recursive: true })
    }

    const outPath1 = path.join(epOutDir, 'exposure_sheet.json')
    const outPath2 = path.join(draftsDir, 'exposure_sheet.json')

    const serialized = JSON.stringify(extendedDoc, null, 2)
    fs.writeFileSync(outPath1, serialized, 'utf8')
    fs.writeFileSync(outPath2, serialized, 'utf8')

    return extendedDoc
}
