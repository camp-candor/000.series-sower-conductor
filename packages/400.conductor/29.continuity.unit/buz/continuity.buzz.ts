import { ContinuityModel } from '../continuity.model.js'
import ContinuityBit from '../fce/continuity.bit.js'
import { ContinuityEvaluationResult } from '../fce/continuity.interface.js'
import State from '../../99.core/state.js'
import { getSqliteInstance } from '../../08.sqlite.unit/buz/sqlite.buzz.js'
import type { SceneAST } from '../../34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.js'

export const evaluateSceneContinuity = (
    ast: SceneAST,
): ContinuityEvaluationResult => {
    const t0_ms = performance.now()
    const db = getSqliteInstance()

    const query = db.prepare(`
    SELECT
      s.is_dirty,
      s.pinned_version,
      s.state_snapshot_hash
    FROM scenes s
    WHERE s.scene_id = ?
  `)

    const record = query.get(ast.scene_id) as
        | {
              is_dirty: number
              pinned_version: number
              state_snapshot_hash: string
          }
        | undefined

    const duration_ms = Math.round(performance.now() - t0_ms)

    // Auto-establish scene record if absent from pilot.db
    if (!record) {
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES (?, ?, 0, ?, ?)
    `,
        ).run(
            ast.scene_id,
            ast.pinned_fact_version,
            ast.state_snapshot_hash,
            Date.now(),
        )

        process.stdout.write(
            `>> [CONTINUITY] [OK] Scene ${ast.scene_id} recorded in ledger (${duration_ms} ms).\n`,
        )
        return { allowed: true, is_dirty: false, duration_ms }
    }

    // Pre-Flight Continuity Short-Circuit Gate (HTTP 412 Equivalence)
    if (record.is_dirty === 1) {
        process.stderr.write(
            `:: [FAIL] DIRTY_SCENE_REJECTED: Scene ${ast.scene_id} dependencies have mutated in pilot.db.\n`,
        )
        return {
            allowed: false,
            is_dirty: true,
            reason: 'DIRTY_SCENE_REJECTED',
            duration_ms,
        }
    }

    // Merkle State Hash Verification Gate
    if (record.state_snapshot_hash !== ast.state_snapshot_hash) {
        process.stderr.write(
            `:: [FAIL] STATE_SNAPSHOT_DIVERGENCE: Hash in AST (${ast.state_snapshot_hash}) != Ledger (${record.state_snapshot_hash}).\n`,
        )
        return {
            allowed: false,
            is_dirty: true,
            reason: 'STATE_SNAPSHOT_DIVERGENCE',
            duration_ms,
        }
    }

    process.stdout.write(
        `>> [CONTINUITY] [OK] Scene ${ast.scene_id} verified clean at T_0 = $0.00 (${duration_ms} ms).\n`,
    )
    return { allowed: true, is_dirty: false, duration_ms }
}

export const initContinuity = (
    cpy: ContinuityModel,
    bal: ContinuityBit,
    _ste?: State,
) => {
    if (bal.slv) bal.slv({ continuityBit: { idx: 'init-continuity', val: 1 } })
    return cpy
}

export const updateContinuity = (
    cpy: ContinuityModel,
    bal: ContinuityBit,
    _ste?: State,
) => {
    if (bal.slv)
        bal.slv({ continuityBit: { idx: 'update-continuity', val: 1 } })
    return cpy
}

export const evaluateContinuityGate = (
    cpy: ContinuityModel,
    bal: ContinuityBit,
    _ste?: State,
) => {
    const ast = bal.dat as SceneAST

    if (!ast || !ast.scene_id) {
        const errMsg = 'INVALID_AST_PAYLOAD: Missing SceneAST data'
        process.stderr.write(`>> [CONTINUITY] [FAIL] ${errMsg}\n`)
        if (bal.slv) {
            return bal.slv({
                continuityBit: {
                    idx: 'evaluate-continuity-error',
                    val: 0,
                    src: errMsg,
                },
            })
        }
        throw new Error(errMsg)
    }

    const result = evaluateSceneContinuity(ast)

    cpy.lastEvaluatedSceneId = ast.scene_id
    cpy.totalScenesChecked += 1
    cpy.lastEvaluationDurationMs = result.duration_ms

    if (!result.allowed) {
        cpy.totalDirtyScenesBlocked += 1
        if (bal.slv) {
            return bal.slv({
                continuityBit: {
                    idx: 'evaluate-continuity-gate',
                    val: 0,
                    src: result.reason,
                    dat: result,
                },
            })
        }
        throw new Error(result.reason)
    }

    if (bal.slv) {
        bal.slv({
            continuityBit: {
                idx: 'evaluate-continuity-gate',
                val: 1,
                src: ast.scene_id,
                dat: result,
            },
        })
    }
    return cpy
}
