import fs from 'node:fs'
import path from 'node:path'
import { AbstractSyntaxTreeModel } from '../abstractsyntaxtree.model.js'
import AbstractSyntaxTreeBit from '../fce/abstractsyntaxtree.bit.js'
import {
    SceneASTSchema,
    SceneAST,
} from '../fce/abstractsyntaxtree.interface.js'
import State from '../../99.core/state.js'

export const deepFreeze = <T>(obj: T): Readonly<T> => {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    Object.freeze(obj)
    for (const key of Object.getOwnPropertyNames(obj)) {
        const val = (obj as Record<string, unknown>)[key]
        if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
            deepFreeze(val)
        }
    }
    return obj as Readonly<T>
}

export const initAbstractSyntaxTree = (
    cpy: AbstractSyntaxTreeModel,
    bal: AbstractSyntaxTreeBit,
    _ste: State,
) => {
    if (bal.slv)
        bal.slv({
            abstractsyntaxtreeBit: { idx: 'init-abstractsyntaxtree', val: 1 },
        })
    return cpy
}

export const parseSceneAST = (
    cpy: AbstractSyntaxTreeModel,
    bal: AbstractSyntaxTreeBit,
    _ste: State,
) => {
    const cns = '>> [AST-INGESTION]'
    let rawJson: unknown

    if (bal.dat?.rawPayload) {
        rawJson = bal.dat.rawPayload
    } else {
        const targetFile = bal.src || 'drafts/dialogue_ast.json'
        const filePath = path.resolve(process.cwd(), targetFile)

        if (!fs.existsSync(filePath)) {
            const errMsg = `AST_NOT_FOUND: Path does not exist: ${filePath}`
            process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
            if (bal.slv)
                return bal.slv({
                    abstractsyntaxtreeBit: {
                        idx: 'parse-scene-ast-error',
                        val: 0,
                        src: errMsg,
                    },
                })
            throw new Error(errMsg)
        }

        try {
            rawJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        } catch (err: any) {
            const errMsg = `JSON_SYNTAX_ERROR: Malformed JSON in ${filePath}: ${err.message}`
            process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
            if (bal.slv)
                return bal.slv({
                    abstractsyntaxtreeBit: {
                        idx: 'parse-scene-ast-error',
                        val: 0,
                        src: errMsg,
                    },
                })
            throw new Error(errMsg)
        }
    }

    const result = SceneASTSchema.safeParse(rawJson)

    if (!result.success) {
        const errorDetails = result.error.errors
            .map((e) => `[${e.path.join('.')}] ${e.message}`)
            .join(', ')
        const errMsg = `SCHEMA_VALIDATION_FAILED: ${errorDetails}`
        process.stderr.write(`${cns} [FAIL] ${errMsg}\n`)
        if (bal.slv)
            return bal.slv({
                abstractsyntaxtreeBit: {
                    idx: 'parse-scene-ast-error',
                    val: 0,
                    src: errMsg,
                    dat: result.error,
                },
            })
        throw new Error(errMsg)
    }

    const validated: SceneAST = deepFreeze(result.data)

    cpy.lastParsedSceneId = validated.scene_id
    cpy.totalLinesValidated = validated.lines.length
    cpy.activeScene = validated

    process.stdout.write(
        `${cns} [OK] Scene AST ${validated.scene_id} validated cleanly (${validated.lines.length} lines).\n`,
    )

    if (bal.slv) {
        bal.slv({
            abstractsyntaxtreeBit: {
                idx: 'parse-scene-ast',
                val: 1,
                src: validated.scene_id,
                dat: validated,
            },
        })
    }
    return cpy
}
