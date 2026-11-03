import { ConductorModel } from '../conductor.model.js'
import ConductorBit from '../fce/conductor.bit.js'
import State from '../../99.core/state.js'

const conductor = {
    list: async () => {
        return { models: [] as any[] }
    },
}

export const initConductor = (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    cpy.status = 'READY'
    process.stdout.write(
        '>> [CONDUCTOR] [OK] packages/400.conductor initialized cleanly.\n',
    )

    const urlconductor =
        'https://zero00-conductor.onrender.com/api/conductor/test'

    Promise.resolve().then(async () => {
        try {
            const res = await fetch(urlconductor)
            const data = await res.json()
            if (bal.slv) {
                bal.slv({
                    intBit: {
                        idx: 'init-conductor',
                        dat: {
                            conductor: data,
                        },
                    },
                })
            }
        } catch (e: any) {
            if (bal.slv) {
                bal.slv({
                    intBit: {
                        idx: 'init-conductor-err',
                        dat: e.message,
                    },
                })
            }
        }
    })

    if (bal.slv) {
        bal.slv({
            conductorBit: {
                idx: 'init-conductor',
                val: 1,
                dat: { status: cpy.status },
            },
        })
    }
    return cpy
}

export const updateConductor = (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    bal.slv({ intBit: { idx: 'update-conductor' } })

    return cpy
}

export const testConductor = (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    bal.slv({ mytBit: { idx: 'test-conductor', val: 1 } })
    return cpy
}

export const listConductor = async (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    const response = await conductor.list()
    if (bal.slv != null)
        bal.slv({
            olmBit: {
                idx: 'list-conductor',
                lst: response.models.map((m: any) => m.name),
            },
        })
    return cpy
}

import * as ActAST from '../../34.abstractsyntaxtree.unit/abstractsyntaxtree.action.js'
import * as ActCont from '../../29.continuity.unit/continuity.action.js'
import * as ActVram from '../../26.vram.unit/vram.action.js'
import * as ActSpeech from '../../09.speech.unit/speech.action.js'

export const runSceneLifecycle = async (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    const cns = '>> [LIFECYCLE]'
    const targetAstFile = bal.src || 'drafts/dialogue_ast.json'
    process.stdout.write(
        `${cns} Commencing Master Pipeline for ${targetAstFile}...\\n`,
    )

    // Step 1: Parse and validate Screenplay AST
    const astRes = await ste.hunt(ActAST.PARSE_SCENE_AST, {
        src: targetAstFile,
        dat: bal.dat?.astPayload
            ? { rawPayload: bal.dat.astPayload }
            : undefined,
    })
    if (astRes.abstractsyntaxtreeBit.val !== 1) {
        const err = `LIFECYCLE_HALT: AST validation failed (${astRes.abstractsyntaxtreeBit.src})`
        process.stderr.write(`${cns} [FAIL] ${err}\\n`)
        if (bal.slv)
            return bal.slv({
                conductorBit: {
                    idx: 'run-scene-lifecycle-error',
                    val: 0,
                    src: err,
                },
            })
        throw new Error(err)
    }
    const ast = astRes.abstractsyntaxtreeBit.dat

    // Step 2: Pre-flight continuity staleness check (<5ms)
    const contRes = await ste.hunt(ActCont.EVALUATE_CONTINUITY_GATE, {
        dat: ast,
    })
    if (contRes.continuityBit.val !== 1) {
        const err = `LIFECYCLE_HALT: Continuity gate rejected scene (${contRes.continuityBit.src})`
        process.stderr.write(`${cns} [FAIL] ${err}\\n`)
        if (bal.slv)
            return bal.slv({
                conductorBit: {
                    idx: 'run-scene-lifecycle-error',
                    val: 0,
                    src: err,
                },
            })
        throw new Error(err)
    }

    // Step 3: Hardware VRAM hygiene flush
    const vramRes = await ste.hunt(ActVram.EXECUTE_VRAM_HYGIENE, {
        dat: {
            bypassNetworkCheck: bal.dat?.bypassNetworkCheck ?? true,
            baselineFreeMb: bal.dat?.baselineFreeMb ?? 21000,
            toleranceMb: bal.dat?.toleranceMb ?? 500,
            timeoutMs: bal.dat?.timeoutMs,
            sampleFn: bal.dat?.sampleFn,
        },
    })
    if (vramRes.vramBit.val !== 1) {
        const err = `LIFECYCLE_HALT: VRAM hygiene gate tripped (${vramRes.vramBit.src})`
        process.stderr.write(`${cns} [FAIL] ${err}\\n`)
        if (bal.slv)
            return bal.slv({
                conductorBit: {
                    idx: 'run-scene-lifecycle-error',
                    val: 0,
                    src: err,
                },
            })
        throw new Error(err)
    }

    // Step 4: Local speech synthesis on Port 8000
    const speechRes = await ste.hunt(ActSpeech.SYNTHESIZE_SCENE_AUDIO, {
        src: bal.dat?.ttsEndpoint || 'http://127.0.0.1:8000',
        dat: {
            ast,
            outputDir: bal.dat?.outputDir || 'scratch/audio/dialogue',
            fetchFn: bal.dat?.fetchFn,
        },
    })

    if (speechRes.speechBit.val !== 1) {
        const err = `LIFECYCLE_HALT: Speech synthesis failed (${speechRes.speechBit.src})`
        process.stderr.write(`${cns} [FAIL] ${err}\\n`)
        if (bal.slv)
            return bal.slv({
                conductorBit: {
                    idx: 'run-scene-lifecycle-error',
                    val: 0,
                    src: err,
                },
            })
        throw new Error(err)
    }

    cpy.totalScenesProcessed += 1
    process.stdout.write(
        `${cns} [OK] Master Pipeline execution completed successfully for scene ${ast.scene_id}.\\n`,
    )

    if (bal.slv) {
        bal.slv({
            conductorBit: {
                idx: 'run-scene-lifecycle',
                val: 1,
                src: ast.scene_id,
                dat: {
                    ast,
                    stems: speechRes.speechBit.dat.stems,
                },
            },
        })
    }
    return cpy
}
