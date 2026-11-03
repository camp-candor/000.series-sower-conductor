import { ContinuityModel } from '../continuity.model.js';
import ContinuityBit from '../fce/continuity.bit.js';
import State from '../../99.core/state.js';
import { getSqliteInstance } from '../../08.sqlite.unit/buz/sqlite.buzz.js';

export const initContinuity = (cpy: ContinuityModel, bal: ContinuityBit, ste?: State) => {
    return cpy;
};

export const updateContinuity = (cpy: ContinuityModel, bal: ContinuityBit, ste?: State) => {
    return cpy;
};

export const evaluateContinuityGate = (cpy: ContinuityModel, bal: ContinuityBit, ste?: State) => {
    const db = getSqliteInstance();
    const ast = bal.dat;

    // We do a SELECT against scenes to find the scene state
    const row = db.prepare('SELECT is_dirty, state_snapshot_hash FROM scenes WHERE scene_id = ?').get(ast.scene_id) as any;

    if (!row) {
        db.prepare(`
            INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
            VALUES (?, ?, ?, ?, ?)
        `).run(ast.scene_id, ast.pinned_fact_version, 0, ast.state_snapshot_hash, Date.now());

        if (bal.slv) {
            bal.slv({ continuityBit: { idx: 'evaluate-continuity-gate', val: 1, dat: { allowed: true } } });
        }
        return cpy;
    }

    if (row.is_dirty === 1) {
        if (bal.slv) {
            bal.slv({ continuityBit: { idx: 'evaluate-continuity-gate', src: 'DIRTY_SCENE_REJECTED', val: 0 } });
        }
        return cpy;
    }

    if (row.state_snapshot_hash !== ast.state_snapshot_hash) {
        if (bal.slv) {
            bal.slv({ continuityBit: { idx: 'evaluate-continuity-gate', src: 'STATE_SNAPSHOT_DIVERGENCE', val: 0 } });
        }
        return cpy;
    }

    if (bal.slv) {
        bal.slv({ continuityBit: { idx: 'evaluate-continuity-gate', val: 1, dat: { allowed: true } } });
    }

    return cpy;
};
