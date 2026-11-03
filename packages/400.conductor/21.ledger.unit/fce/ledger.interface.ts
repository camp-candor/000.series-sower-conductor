import { Model } from '../../99.core/interface/model.interface.js'

export interface FactRecord {
    fact_id: string
    category: string
    version: number
    content_json: string
    merkle_leaf_hash: string
    updated_at_ms: number
}

export interface SceneRecord {
    scene_id: string
    pinned_version: number
    is_dirty: number
    state_snapshot_hash: string
    updated_at_ms: number
}

export default interface Ledger extends Model {
    lastEventId: string
    totalEventsLogged: number
    unsealedDeltasCount: number
}
