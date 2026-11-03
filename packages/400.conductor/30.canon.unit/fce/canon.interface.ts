import { Model } from '../../99.core/interface/model.interface.js'

export interface BibleState {
    series_slug: string
    canon_merkle_root: string
    characters: Record<string, unknown>
    environments: Record<string, unknown>
    grievances: Record<string, unknown>
    props: Record<string, unknown>
    compiled_at_ms: number
}

export default interface Canon extends Model {
    activeSeriesSlug: string
    activeMerkleRoot: string
    isFrozen: boolean
    activeCanon: Readonly<BibleState> | null
}
