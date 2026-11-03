export const initContinuity = (
    cpy: ContinuityModel,
    bal: ContinuityBit,
    ste: State,
) => {
    debugger
    return cpy
}

export const updateContinuity = (
    cpy: ContinuityModel,
    bal: ContinuityBit,
    ste: State,
) => {
    return cpy
}

export const evaluateContinuityGate = (
    cpy: ContinuityModel,
    bal: ContinuityBit,
    ste: State,
) => {
    const db = getSqliteInstance()
    const ast = bal.dat

    if (!ast || !ast.scene_id) {
        if (bal.slv) bal.slv({ continuityBit: { val: 0, src: 'INVALID_AST' } })
        return cpy
    }

    const row = db.prepare('SELECT is_dirty, state_snapshot_hash FROM scenes WHERE scene_id = ?').get(ast.scene_id) as any

    if (row) {
        if (row.is_dirty === 1) {
            if (bal.slv) bal.slv({ continuityBit: { val: 0, src: 'DIRTY_SCENE_REJECTED' } })
            return cpy
        }
        if (row.state_snapshot_hash !== ast.state_snapshot_hash) {
            if (bal.slv) bal.slv({ continuityBit: { val: 0, src: 'STATE_SNAPSHOT_DIVERGENCE' } })
            return cpy
        }
    } else {
        db.prepare(`
            INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
            VALUES (?, ?, ?, ?, ?)
        `).run(ast.scene_id, ast.pinned_fact_version, 0, ast.state_snapshot_hash, Date.now())
    }

    if (bal.slv) bal.slv({ continuityBit: { val: 1, dat: { allowed: true } } })

    return cpy
}

import { ContinuityModel } from '../continuity.model.js'
import ContinuityBit from '../fce/continuity.bit.js'
import State from '../../99.core/state.js'
import { getSqliteInstance } from '../../08.sqlite.unit/buz/sqlite.buzz.js'
