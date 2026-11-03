import { LedgerModel } from '../ledger.model.js'
import LedgerBit from '../fce/ledger.bit.js'
import State from '../../99.core/state.js'
import { getSqliteInstance } from '../../08.sqlite.unit/buz/sqlite.buzz.js'

export const initLedger = (cpy: LedgerModel, bal: LedgerBit, _ste?: State) => {
    if (bal.slv) bal.slv({ ledgerBit: { idx: 'init-ledger', val: 1 } })
    return cpy
}

export const insertFact = (cpy: LedgerModel, bal: LedgerBit, _ste?: State) => {
    const db = getSqliteInstance()
    const {
        fact_id,
        category,
        version,
        content_json,
        merkle_leaf_hash,
        updated_at_ms,
    } = bal.dat

    db.prepare(
        `
    INSERT INTO facts (fact_id, category, version, content_json, merkle_leaf_hash, updated_at_ms)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    ).run(
        fact_id,
        category,
        version ?? 1,
        content_json,
        merkle_leaf_hash,
        updated_at_ms ?? Date.now(),
    )

    if (bal.slv)
        bal.slv({ ledgerBit: { idx: 'insert-fact', val: 1, src: fact_id } })
    return cpy
}

export const bumpFactVersion = (
    cpy: LedgerModel,
    bal: LedgerBit,
    _ste?: State,
) => {
    const db = getSqliteInstance()
    const { fact_id, new_version, updated_at_ms } = bal.dat

    const res = db
        .prepare(
            `
    UPDATE facts
    SET version = ?, updated_at_ms = ?
    WHERE fact_id = ?
  `,
        )
        .run(new_version, updated_at_ms ?? Date.now(), fact_id)

    if (bal.slv)
        bal.slv({
            ledgerBit: {
                idx: 'bump-fact-version',
                val: res.changes,
                src: fact_id,
            },
        })
    return cpy
}

export const registerSceneDependency = (
    cpy: LedgerModel,
    bal: LedgerBit,
    _ste?: State,
) => {
    const db = getSqliteInstance()
    const {
        scene_id,
        fact_id,
        pinned_fact_version,
        state_snapshot_hash,
        pinned_version,
    } = bal.dat

    const tx = db.transaction(() => {
        db.prepare(
            `
      INSERT INTO scenes (scene_id, pinned_version, is_dirty, state_snapshot_hash, updated_at_ms)
      VALUES (?, ?, 0, ?, ?)
      ON CONFLICT(scene_id) DO NOTHING
    `,
        ).run(
            scene_id,
            pinned_version ?? pinned_fact_version,
            state_snapshot_hash,
            Date.now(),
        )

        db.prepare(
            `
      INSERT INTO scene_fact_dependencies (scene_id, fact_id, pinned_fact_version)
      VALUES (?, ?, ?)
    `,
        ).run(scene_id, fact_id, pinned_fact_version)
    })

    tx()

    if (bal.slv)
        bal.slv({
            ledgerBit: {
                idx: 'register-scene-dependency',
                val: 1,
                src: scene_id,
            },
        })
    return cpy
}

export const appendEvent = (cpy: LedgerModel, bal: LedgerBit, _ste?: State) => {
    const db = getSqliteInstance()
    const {
        event_id,
        stream_id,
        tick,
        type,
        actor_id,
        target_id,
        seed,
        payload_json,
        prev_hash,
        state_hash,
        timestamp_ms,
    } = bal.dat

    const res = db
        .prepare(
            `
    INSERT INTO event_log (
      event_id, stream_id, tick, type, actor_id, target_id, seed, payload_json, prev_hash, state_hash, timestamp_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        )
        .run(
            event_id,
            stream_id,
            tick ?? 0,
            type,
            actor_id ?? null,
            target_id ?? null,
            seed,
            payload_json,
            prev_hash,
            state_hash,
            timestamp_ms ?? Date.now(),
        )

    cpy.lastEventId = event_id
    cpy.totalEventsLogged += 1

    if (bal.slv)
        bal.slv({
            ledgerBit: {
                idx: 'append-event',
                val: Number(res.lastInsertRowid),
                src: event_id,
            },
        })
    return cpy
}
