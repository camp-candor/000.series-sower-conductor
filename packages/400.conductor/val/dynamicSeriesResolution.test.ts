import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
    compileParallaxSceneAst,
    compileSeriesSceneAst,
    discoverDraftScenePairs,
    loadActiveBibleManifest,
    resolveSpeakerCueAgainstBible,
    matchFountainActionLinesAgainstFoleyRegistry,
} from '../34.abstractsyntaxtree.unit/buz/parallaxAstCompiler.buzz.js'
import { SceneASTSchema } from '../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'
import {
    updateMenu,
    runParallaxDinnerAudioFirstPipeline,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'

describe('Dynamic Series and Speaker Resolution in 000.series-sower-conductor', () => {
    let tmpDir: string

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(
            path.join(os.tmpdir(), 'conductor-dynamic-series-'),
        )
    })

    afterEach(() => {
        delete (global as any).LIBRARY
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true })
        }
        vi.restoreAllMocks()
    })

    it('dynamically resolves arbitrary speaker cues against bible-state.json manifest and accepts non-34 turn counts', () => {
        const compiledDir = path.join(
            tmpDir,
            'compiled',
            'gotham-trinity-crisis',
        )
        fs.mkdirSync(compiledDir, { recursive: true })

        const customBibleState = {
            series_slug: 'gotham-trinity-crisis',
            root_merkle_hash:
                'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
            entities: {
                char_batman: {
                    id: 'char_batman',
                    entity_type: 'character',
                    title: 'Batman',
                },
                char_superman: {
                    id: 'char_superman',
                    entity_type: 'character',
                    title: 'Superman',
                },
                char_wonder_woman: {
                    id: 'char_wonder_woman',
                    entity_type: 'character',
                    title: 'Wonder Woman',
                },
                loc_watchtower_bridge: {
                    id: 'loc_watchtower_bridge',
                    entity_type: 'location',
                    title: 'Watchtower Command Bridge',
                },
            },
            foley_registry: {
                cape_snap: [
                    'foley/cape_snap/snap_v1.wav',
                    'foley/cape_snap/snap_v2.wav',
                ],
                lasso_hum: ['foley/lasso_hum/hum_v1.wav'],
            },
        }

        const biblePath = path.join(compiledDir, 'bible-state.json')
        fs.writeFileSync(biblePath, JSON.stringify(customBibleState, null, 2))

        const loadedManifest = loadActiveBibleManifest({
            seriesSlug: 'gotham-trinity-crisis',
            baseDir: tmpDir,
        })

        expect(loadedManifest.seriesSlug).toBe('gotham-trinity-crisis')
        expect(loadedManifest.environmentId).toBe('loc_watchtower_bridge')
        expect(resolveSpeakerCueAgainstBible('BATMAN', loadedManifest)).toBe(
            'char_batman',
        )
        expect(resolveSpeakerCueAgainstBible('SUPERMAN', loadedManifest)).toBe(
            'char_superman',
        )
        expect(
            resolveSpeakerCueAgainstBible('WONDER WOMAN', loadedManifest),
        ).toBe('char_wonder_woman')

        const sixTurnScript = `/*
[SPATIAL_STAGE_HEADER]
SERIES_SLUG: gotham-trinity-crisis
*/
Title: GOTHAM TRINITY CRISIS
Credit: Written by
Author: Sower Engine
Draft date: 2026-11-13

===

INT. WATCHTOWER COMMAND BRIDGE - NIGHT

A sharp cape snap echoes across the steel deck as rain squall hits the dome.

BATMAN
(scanning telemetry)
The orbital relay is compromised.

SUPERMAN
I can reach the satellite before the next solar flare.

WONDER WOMAN
Wait. A golden lasso hum vibrates against the console.

BATMAN
Hold your position, Clark.

SUPERMAN
We do not have ten minutes, Bruce.

WONDER WOMAN
Then we move together.
`

        const ast = compileSeriesSceneAst(sixTurnScript, {
            sceneId: 'ep01_sc01',
            seriesSlug: 'gotham-trinity-crisis',
            baseDir: tmpDir,
        })

        expect(SceneASTSchema.parse(ast)).toBeDefined()
        expect(ast.lines).toHaveLength(6)
        expect(ast.environment_id).toBe('loc_watchtower_bridge')
        expect(ast.state_snapshot_hash).toBe(
            'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        )
        expect(ast.lines[0].speaker_id).toBe('char_batman')
        expect(ast.lines[1].speaker_id).toBe('char_superman')
        expect(ast.lines[2].speaker_id).toBe('char_wonder_woman')
        expect(ast.lines[3].speaker_id).toBe('char_batman')
        expect(ast.lines[4].speaker_id).toBe('char_superman')
        expect(ast.lines[5].speaker_id).toBe('char_wonder_woman')

        const foleyPlacements = matchFountainActionLinesAgainstFoleyRegistry(
            sixTurnScript,
            'ep01_sc01',
            loadedManifest.foleyRegistry,
        )
        expect(foleyPlacements.length).toBeGreaterThanOrEqual(1)
        expect(foleyPlacements[0].cue_name).toBe('cape_snap')
    })

    it('resolves Miss Beverly and other Wiregrass Basin characters without binary JOHNNY/ORBIE ternary fallback', () => {
        const script = `INT. DIXIE-STARLIGHT DINER - NIGHT

JOHNNY
Evening, folks.

MISS BEVERLY
More decaf, sugar?

ORBIE
Do not tilt the carafe.
`
        const ast = compileParallaxSceneAst(script, {
            sceneId: 'ep01_sc01',
            baseDir: tmpDir,
        })

        expect(ast.lines).toHaveLength(3)
        expect(ast.lines[0].speaker_id).toBe('char_johnny_walkman')
        expect(ast.lines[1].speaker_id).toBe('char_miss_beverly')
        expect(ast.lines[2].speaker_id).toBe('char_orbie_mayhaw')
    })

    it('opens a Blessed choice list of available .fountain and dialogue_ast.json pairs when selecting RUN MASTER SCENE LIFECYCLE or AUDIT DIALOGUE AST CONTRACT', async () => {
        const draftsDir = path.join(tmpDir, 'drafts')
        fs.mkdirSync(draftsDir, { recursive: true })

        const fountainPath = path.join(
            draftsDir,
            'wiregrass_basin_scene.fountain',
        )
        const customFountain = `INT. DIXIE-STARLIGHT DINER - NIGHT

South Georgia rain squall beats against the window.
She does a coffee pour.

JOHNNY
Checking the horizon line.

MISS BEVERLY
Fresh pot on the burner.

ORBIE
Keep your posture aligned.
`
        fs.writeFileSync(fountainPath, customFountain, 'utf8')

        const pairs = discoverDraftScenePairs(tmpDir)
        expect(pairs.length).toBeGreaterThanOrEqual(1)
        expect(pairs[0].label).toContain('wiregrass_basin_scene.fountain')

        const openChoiceCalls: string[][] = []
        let callIndex = 0
        ;(global as any).LIBRARY = {
            hunt: vi.fn().mockImplementation((action: string, payload: any) => {
                if (action === '[Open action] Open Choice') {
                    openChoiceCalls.push(payload.lst)
                    callIndex++
                    if (callIndex === 1) {
                        return Promise.resolve({
                            chcBit: {
                                src: 'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
                            },
                        })
                    }
                    return Promise.resolve({
                        chcBit: {
                            src: pairs[0].label,
                        },
                    })
                }
                return Promise.resolve({ grdBit: { dat: {} } })
            }),
        }

        const steHunt = vi.fn().mockResolvedValue({ lfcBit: { val: 1 } })
        const model = new MenuModel()

        await updateMenu(
            model,
            {
                idx: 'test-lifecycle-pair-picker',
                dat: { baseDir: tmpDir } as any,
                slv: vi.fn(),
            },
            { hunt: steHunt } as any,
        )

        expect(openChoiceCalls.length).toBe(2)
        expect(openChoiceCalls[1]).toContain(pairs[0].label)

        expect(steHunt).toHaveBeenCalledWith(
            '[Lifecycle action] Chain Master Scene Lifecycle',
            expect.objectContaining({
                src: 'ep01_sc01',
                dat: expect.objectContaining({
                    lifecycleContext: expect.objectContaining({
                        shots: expect.arrayContaining([
                            expect.objectContaining({
                                speakerId: 'char_johnny_walkman',
                                dialogueText: 'Checking the horizon line.',
                            }),
                            expect.objectContaining({
                                speakerId: 'char_miss_beverly',
                                dialogueText: 'Fresh pot on the burner.',
                            }),
                            expect.objectContaining({
                                speakerId: 'char_orbie_mayhaw',
                                dialogueText: 'Keep your posture aligned.',
                            }),
                        ]),
                    }),
                }),
            }),
        )
    })

    it('runs RUN PARALLAX DINNER AUDIO-FIRST PIPELINE with non-34 turn count and custom Foley cues', async () => {
        const fiveTurnFountain = `INT. DIXIE-STARLIGHT DINER - NIGHT

South Georgia rain squall beats against the window.
Waitress drops the laminated menu (menu drop).

JOHNNY
Testing turn one.

MISS BEVERLY
Testing turn two.

ORBIE
Testing turn three.

JOHNNY
Testing turn four.

MISS BEVERLY
Testing turn five.
`
        const model = new MenuModel()
        let resolved: any = null

        await runParallaxDinnerAudioFirstPipeline(
            model,
            {
                idx: 'test-5-turn-pipeline',
                dat: {
                    baseDir: tmpDir,
                    fountainText: fiveTurnFountain,
                } as any,
                slv: (res: any) => {
                    resolved = res
                },
            },
            {} as any,
        )

        expect(resolved?.mnuBit?.val).toBe(1)
        expect(resolved?.mnuBit?.dat?.ast?.lines).toHaveLength(5)
        expect(resolved?.mnuBit?.dat?.ast?.lines[1].speaker_id).toBe(
            'char_miss_beverly',
        )
        expect(
            resolved?.mnuBit?.dat?.exposureDoc?.foleyPlacements,
        ).toHaveLength(2)
    })
})
