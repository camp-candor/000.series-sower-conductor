import fs from 'node:fs'
import path from 'node:path'
import {
    SceneAST,
    SceneASTSchema,
    DialogueLine,
} from '../fce/abstractsyntaxtree.interface.js'
import {
    parseFountainDialogue,
    extractFountainActionLines,
    normalizePunctuation,
} from './fountainTokenizer.buzz.js'
import { assertVerbatimParity } from './assertParity.buzz.js'
import {
    matchActionLinesToFoleyPlacements,
    PARALLAX_FOLEY_REGISTRY,
    FoleyPlacement,
} from '../../32.audio.unit/buz/foleyMatcher.buzz.js'

export interface BibleCharacterEntry {
    id: string
    name: string
    cue: string
}

export interface ActiveBibleManifest {
    seriesSlug: string
    stateSnapshotHash: string
    environmentId: string
    characters: BibleCharacterEntry[]
    foleyRegistry: Record<string, string[]>
    rawManifest: Record<string, any>
}

export interface CompileSceneAstOptions {
    sceneId?: string
    seriesSlug?: string
    bibleStatePath?: string
    bibleManifest?: Record<string, any> | ActiveBibleManifest
    outputDraftPath?: string
    outputSceneDir?: string
    baseDir?: string
    skipDiskWrite?: boolean
}

export interface DraftScenePair {
    id: string
    label: string
    seriesSlug: string
    fountainPath?: string
    astPath?: string
    bibleStatePath?: string
}

export function deriveCueFromName(nameOrId: string): string {
    const clean = nameOrId
        .replace(/^char_/i, '')
        .replace(/^(DR\.|MR\.|MRS\.|MS\.|CAPT\.|LT\.|SGT\.|PROF\.)\s+/i, '')
        .trim()
    const parts = clean.split(/[\s_-]+/).filter(Boolean)
    if (parts.length === 0) return 'UNKNOWN'
    const first = parts[0]!.toUpperCase()
    if (
        (first === 'MISS' ||
            first === 'UNCLE' ||
            first === 'AUNT' ||
            first === 'DETECTIVE' ||
            first === 'COMMISSIONER') &&
        parts.length >= 2
    ) {
        return `${first} ${parts[1]!.toUpperCase()}`
    }
    return first
}

export function normalizeBibleManifest(
    raw: Record<string, any> | null | undefined,
    fallbackSlug = 'wiregrass-basin',
): ActiveBibleManifest {
    const data = raw && typeof raw === 'object' ? raw : {}
    const seriesSlug =
        typeof data.series_slug === 'string' &&
        data.series_slug.trim().length > 0
            ? data.series_slug.trim()
            : typeof data.seriesSlug === 'string' &&
                data.seriesSlug.trim().length > 0
              ? data.seriesSlug.trim()
              : fallbackSlug

    const rawHash =
        data.root_merkle_hash ??
        data.canon_merkle_root ??
        data._meta?.state_hash ??
        data.stateSnapshotHash
    const stateSnapshotHash =
        typeof rawHash === 'string' && /^[a-f0-9]{64}$/i.test(rawHash)
            ? rawHash.toLowerCase()
            : '1111111111111111111111111111111111111111111111111111111111111111'

    const characters: BibleCharacterEntry[] = []
    const seenCharIds = new Set<string>()

    const registerChar = (key: string, entry: any) => {
        if (!entry || typeof entry !== 'object') return
        const id = String(entry.id ?? key).trim()
        if (!id || seenCharIds.has(id)) return
        const name = String(entry.name ?? entry.title ?? id).trim()
        const cue = String(entry.cue ?? deriveCueFromName(name)).toUpperCase()
        seenCharIds.add(id)
        characters.push({ id, name, cue })
    }

    if (Array.isArray(data.characters)) {
        for (const c of data.characters) {
            if (c && typeof c === 'object') {
                registerChar(String(c.id ?? c.name ?? ''), c)
            }
        }
    } else if (data.characters && typeof data.characters === 'object') {
        for (const [k, v] of Object.entries(data.characters)) {
            registerChar(k, v)
        }
    }

    const entities = data.entities
    if (entities && typeof entities === 'object') {
        if (entities.characters && typeof entities.characters === 'object') {
            for (const [k, v] of Object.entries(entities.characters)) {
                registerChar(k, v)
            }
        }
        for (const [k, v] of Object.entries(entities)) {
            if (!v || typeof v !== 'object') continue
            const ent = v as Record<string, any>
            if (ent.entity_type === 'character' || k.startsWith('char_')) {
                registerChar(k, ent)
            }
        }
    }

    if (characters.length === 0) {
        characters.push(
            {
                id: 'char_johnny_walkman',
                name: 'Johnny Walkman',
                cue: 'JOHNNY',
            },
            {
                id: 'char_orbie_mayhaw',
                name: 'Dr. Orbie Mayhaw',
                cue: 'ORBIE',
            },
            {
                id: 'char_miss_beverly',
                name: 'Miss Beverly',
                cue: 'MISS BEVERLY',
            },
        )
    }

    let environmentId = 'env_diner'
    if (
        typeof data.environmentId === 'string' &&
        data.environmentId.length > 0
    ) {
        environmentId = data.environmentId
    } else if (data.environments && typeof data.environments === 'object') {
        const envKeys = Object.keys(data.environments)
        if (envKeys.length > 0) {
            const firstEnv = (data.environments as any)[envKeys[0]!]
            environmentId = String(firstEnv?.id ?? envKeys[0])
        }
    } else if (entities && typeof entities === 'object') {
        for (const [k, v] of Object.entries(entities)) {
            if (!v || typeof v !== 'object') continue
            const ent = v as Record<string, any>
            if (ent.entity_type === 'location' || k.startsWith('loc_')) {
                environmentId = String(ent.id ?? k)
                break
            }
        }
    }

    const foleyRegistry: Record<string, string[]> = {}
    const rawFoley = data.foley_registry ?? data.foleyRegistry ?? data.foley
    if (rawFoley && typeof rawFoley === 'object') {
        for (const [cueKey, samples] of Object.entries(rawFoley)) {
            if (Array.isArray(samples) && samples.length > 0) {
                foleyRegistry[cueKey] = samples.map((s) => String(s))
            }
        }
    }
    for (const [cueKey, samples] of Object.entries(PARALLAX_FOLEY_REGISTRY)) {
        if (!foleyRegistry[cueKey]) {
            foleyRegistry[cueKey] = samples
        }
    }

    return {
        seriesSlug,
        stateSnapshotHash,
        environmentId,
        characters,
        foleyRegistry,
        rawManifest: data,
    }
}

export function loadActiveBibleManifest(options?: {
    seriesSlug?: string
    bibleStatePath?: string
    baseDir?: string
}): ActiveBibleManifest {
    const cwd = options?.baseDir ? path.resolve(options.baseDir) : process.cwd()
    const slug = options?.seriesSlug || 'wiregrass-basin'

    const candidatePaths: string[] = []
    if (options?.bibleStatePath) {
        candidatePaths.push(path.resolve(cwd, options.bibleStatePath))
    }

    const siblingEngineRoot = path.resolve(cwd, '..', '000.series-sower-engine')
    candidatePaths.push(
        path.join(cwd, 'compiled', slug, 'bible-state.json'),
        path.join(cwd, 'data', 'ingress', slug, 'bible-state.json'),
        path.join(
            cwd,
            'apps',
            '995.library',
            'series',
            slug,
            'compiled',
            'bible-state.json',
        ),
        path.join(siblingEngineRoot, 'compiled', slug, 'bible-state.json'),
        path.join(
            siblingEngineRoot,
            'apps',
            '995.library',
            'series',
            slug,
            'compiled',
            'bible-state.json',
        ),
        path.join(cwd, 'compiled', 'wiregrass-basin', 'bible-state.json'),
        path.join(
            siblingEngineRoot,
            'compiled',
            'wiregrass-basin',
            'bible-state.json',
        ),
    )

    for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
            try {
                const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'))
                const normalized = normalizeBibleManifest(parsed, slug)
                // If this manifest has real characters, or if no other candidate exists, return it
                if (
                    Object.keys(parsed.characters ?? {}).length > 0 ||
                    Object.keys(parsed.entities ?? {}).length > 0
                ) {
                    return normalized
                }
            } catch {
                // Continue searching
            }
        }
    }

    return normalizeBibleManifest(null, slug)
}

export function resolveSpeakerCueAgainstBible(
    speakerCue: string,
    manifest: ActiveBibleManifest | Record<string, any> | null | undefined,
): string {
    const normalizedManifest =
        manifest &&
        typeof manifest === 'object' &&
        Array.isArray((manifest as ActiveBibleManifest).characters) &&
        typeof (manifest as ActiveBibleManifest).seriesSlug === 'string'
            ? (manifest as ActiveBibleManifest)
            : normalizeBibleManifest(manifest)

    const cueUpper = speakerCue
        .replace(/^char_/i, '')
        .trim()
        .toUpperCase()
    const cueCompact = cueUpper.replace(/[^A-Z0-9]+/g, '_')

    for (const char of normalizedManifest.characters) {
        const charIdUpper = char.id.toUpperCase()
        const charIdSlug = charIdUpper.replace(/^CHAR_/, '')
        const charNameUpper = char.name.toUpperCase()
        const charCueUpper = char.cue.toUpperCase()

        if (
            cueUpper === charCueUpper ||
            cueUpper === charNameUpper ||
            cueUpper === charIdUpper ||
            cueUpper === charIdSlug ||
            cueCompact === charIdSlug ||
            charNameUpper.includes(cueUpper) ||
            cueUpper.includes(charCueUpper)
        ) {
            return char.id
        }

        const tokens = charNameUpper
            .replace(/[^A-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((t) => t.length >= 2)
        if (tokens.includes(cueUpper)) {
            return char.id
        }
    }

    // Deterministic slugified fallback for any unindexed speaker cue
    const slugified = speakerCue
        .toLowerCase()
        .replace(/^char_/, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
    return `char_${slugified || 'unknown'}`
}

export function matchFountainActionLinesAgainstFoleyRegistry(
    fountainText: string,
    sceneId = 'ep01_sc01',
    foleyRegistry: Record<string, string[]> = PARALLAX_FOLEY_REGISTRY,
): FoleyPlacement[] {
    const rawActionStrings = extractFountainActionLines(fountainText)
    const actionItems = rawActionStrings.map((text, idx) => ({
        text,
        frameOffset: idx * 150,
    }))
    return matchActionLinesToFoleyPlacements(
        sceneId,
        actionItems,
        foleyRegistry,
    )
}

export function discoverDraftScenePairs(baseDir?: string): DraftScenePair[] {
    const rootDir = baseDir ? path.resolve(baseDir) : process.cwd()
    const pairs: DraftScenePair[] = []
    const seenIds = new Set<string>()

    const draftsDir = path.join(rootDir, 'drafts')
    const defaultAstPath = path.join(draftsDir, 'dialogue_ast.json')

    if (fs.existsSync(draftsDir)) {
        const entries = fs.readdirSync(draftsDir)
        const fountainFiles = entries
            .filter((f) => f.endsWith('.fountain'))
            .sort((a, b) => a.localeCompare(b))

        for (const fFile of fountainFiles) {
            const fullFountainPath = path.join(draftsDir, fFile)
            const baseSlug = fFile
                .replace(/_scene\.fountain$/i, '')
                .replace(/\.fountain$/i, '')
            const candidateSpecificAst = path.join(
                draftsDir,
                `${baseSlug}_dialogue_ast.json`,
            )
            const resolvedAstPath = fs.existsSync(candidateSpecificAst)
                ? candidateSpecificAst
                : fs.existsSync(defaultAstPath)
                  ? defaultAstPath
                  : undefined

            const seriesSlug =
                baseSlug === 'active_scene' ||
                baseSlug === 'the_parallax_dinner'
                    ? 'wiregrass-basin'
                    : baseSlug.replace(/_/g, '-')

            const id = `drafts/${fFile}`
            if (!seenIds.has(id)) {
                seenIds.add(id)
                pairs.push({
                    id,
                    label: `${fFile} + ${resolvedAstPath ? path.basename(resolvedAstPath) : 'dialogue_ast.json'}`,
                    seriesSlug,
                    fountainPath: fullFountainPath,
                    astPath: resolvedAstPath,
                })
            }
        }

        if (fountainFiles.length === 0 && fs.existsSync(defaultAstPath)) {
            const id = 'drafts/dialogue_ast.json'
            seenIds.add(id)
            pairs.push({
                id,
                label: 'drafts/dialogue_ast.json (AST Contract)',
                seriesSlug: 'wiregrass-basin',
                astPath: defaultAstPath,
            })
        }
    }

    const ingressRoot = path.join(rootDir, 'data', 'ingress')
    if (fs.existsSync(ingressRoot)) {
        const slugDirs = fs
            .readdirSync(ingressRoot, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .sort((a, b) => a.localeCompare(b))

        for (const slug of slugDirs) {
            const slugDir = path.join(ingressRoot, slug)
            const entries = fs.readdirSync(slugDir)
            const fFile = entries.find((e) => e.endsWith('.fountain'))
            const astFile = entries.find((e) => e.endsWith('.json'))
            if (fFile || astFile) {
                const id = `ingress/${slug}`
                if (!seenIds.has(id)) {
                    seenIds.add(id)
                    pairs.push({
                        id,
                        label: `ingress/${slug}/${fFile ?? 'dialogue_ast.json'}`,
                        seriesSlug: slug,
                        fountainPath: fFile
                            ? path.join(slugDir, fFile)
                            : undefined,
                        astPath: astFile
                            ? path.join(slugDir, astFile)
                            : undefined,
                    })
                }
            }
        }
    }

    if (pairs.length === 0) {
        pairs.push({
            id: 'default/parallax_dinner',
            label: 'drafts/dialogue_ast.json (Default Parallax Scene)',
            seriesSlug: 'wiregrass-basin',
            astPath: fs.existsSync(defaultAstPath) ? defaultAstPath : undefined,
        })
    }

    return pairs
}

export const PARALLAX_DINNER_FOUNTAIN_SOURCE = `INT. WIREGRASS BASIN - NIGHT

JOHNNY
(into radio)
Miss Beverly, do you copy?

ORBIE
(CONT'D)
I copy, Walkman.

JOHNNY
We have a situation.

ORBIE
(CONT'D)
Specify the situation.

JOHNNY
(CONT'D)
The dinner is burnt.

ORBIE
(CONT'D)
Then we eat it burnt.

JOHNNY
Are you sure?

ORBIE
(CONT'D)
Yes.

JOHNNY
(CONT'D)
Understood.

ORBIE
(CONT'D)
Good.

JOHNNY
Over and out.

ORBIE
Out.

JOHNNY
(to himself)
Crazy.

ORBIE
I heard that.

JOHNNY
Sorry.

ORBIE
It's fine.

JOHNNY
Okay.

ORBIE
Okay.

JOHNNY
Right.

ORBIE
Right.

JOHNNY
Yeah.

ORBIE
Yeah.

JOHNNY
Sure.

ORBIE
Sure.

JOHNNY
Fine.

ORBIE
Fine.

JOHNNY
Done.

ORBIE
Done.

JOHNNY
One.

ORBIE
Two.

JOHNNY
Three.

ORBIE
Four.

JOHNNY
Five.

ORBIE
Six.
`

export function compileSeriesSceneAst(
    fountainText: string,
    options: CompileSceneAstOptions = {},
): SceneAST {
    const sceneId = options.sceneId || 'ep01_sc01'
    const manifest: ActiveBibleManifest = options.bibleManifest
        ? Array.isArray(
              (options.bibleManifest as ActiveBibleManifest).characters,
          ) &&
          typeof (options.bibleManifest as ActiveBibleManifest).seriesSlug ===
              'string'
            ? (options.bibleManifest as ActiveBibleManifest)
            : normalizeBibleManifest(
                  options.bibleManifest,
                  options.seriesSlug || 'wiregrass-basin',
              )
        : loadActiveBibleManifest({
              seriesSlug: options.seriesSlug,
              bibleStatePath: options.bibleStatePath,
              baseDir: options.baseDir,
          })

    const extracted = parseFountainDialogue(fountainText)

    const lines: DialogueLine[] = extracted.map((turn, i) => {
        const speakerId = resolveSpeakerCueAgainstBible(turn.speaker, manifest)
        const clean = normalizePunctuation(turn.dialogueText)

        return {
            line_id: `line_${String(i + 1).padStart(3, '0')}`,
            speaker_id: speakerId,
            dialogue_clean_ascii: clean,
            emotional_tag: 'NEUTRAL' as const,
            somatic_dsp: {
                gain_attenuation_bps: 0,
                pitch_shift_cents: 0,
                breathiness_bps: 0,
                ducking_depth_db: -14,
            },
            mru_directive: {
                mru_phase: 'RATIONAL_ACTION' as const,
                stimulus_id: 'stim_default',
                intensity_bps: 1000,
            },
        }
    })

    const uniqueSpeakers = Array.from(new Set(lines.map((l) => l.speaker_id)))
    const focalEntityId =
        uniqueSpeakers[0] ?? manifest.characters[0]?.id ?? 'char_johnny_walkman'
    const secondaryEntityId =
        uniqueSpeakers[1] ??
        manifest.characters[1]?.id ??
        manifest.characters[0]?.id

    const ast: SceneAST = {
        scene_id: sceneId,
        episode_number: 1,
        sequence_index: 0,
        state_snapshot_hash: manifest.stateSnapshotHash,
        pinned_fact_version: 1,
        environment_id: manifest.environmentId || 'env_diner',
        camera_framing: {
            shot_type: 'MEDIUM_SHOT',
            focal_entity_id: focalEntityId,
            ...(secondaryEntityId
                ? { secondary_entity_id: secondaryEntityId }
                : {}),
        },
        lines,
    }

    SceneASTSchema.parse(ast)
    assertVerbatimParity(
        fountainText,
        lines.map((l) => l.dialogue_clean_ascii),
    )

    if (!options.skipDiskWrite) {
        const rootDir = options.baseDir
            ? path.resolve(options.baseDir)
            : process.cwd()
        const draftTarget = options.outputDraftPath
            ? path.resolve(rootDir, options.outputDraftPath)
            : path.join(rootDir, 'drafts', 'dialogue_ast.json')
        fs.mkdirSync(path.dirname(draftTarget), { recursive: true })
        fs.writeFileSync(draftTarget, JSON.stringify(ast, null, 4))

        const outputsPath = options.outputSceneDir
            ? path.resolve(rootDir, options.outputSceneDir)
            : path.join(rootDir, 'outputs', sceneId)
        fs.mkdirSync(outputsPath, { recursive: true })
        fs.writeFileSync(
            path.join(outputsPath, 'dialogue_ast.json'),
            JSON.stringify(ast, null, 4),
        )
    }

    return ast
}

export function compileParallaxSceneAst(
    fountainText: string,
    sceneIdOrOptions: string | CompileSceneAstOptions = 'ep01_sc01',
    maybeOptions?: CompileSceneAstOptions,
): SceneAST {
    if (typeof sceneIdOrOptions === 'object' && sceneIdOrOptions !== null) {
        return compileSeriesSceneAst(fountainText, sceneIdOrOptions)
    }
    const resolvedSceneId =
        typeof sceneIdOrOptions === 'string' && sceneIdOrOptions.length > 0
            ? sceneIdOrOptions
            : 'ep01_sc01'
    return compileSeriesSceneAst(fountainText, {
        ...(maybeOptions ?? {}),
        sceneId: resolvedSceneId,
    })
}
