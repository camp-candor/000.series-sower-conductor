import { Model } from '../../99.core/interface/model.interface.js'

export interface PinnedTrees {
    characters_tree_sha: string
    environments_tree_sha: string
    props_tree_sha: string
}

export interface AssetManifest {
    manifest_version: string
    series_slug: string
    pinned_trees: PinnedTrees
}

export default interface Asset extends Model {
    seriesSlug: string
    manifestVersion: string
    isParityVerified: boolean
    liveTrees: PinnedTrees | null
}
