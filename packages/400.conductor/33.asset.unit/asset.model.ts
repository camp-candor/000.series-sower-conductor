import Asset, { PinnedTrees } from './fce/asset.interface.js'

export class AssetModel implements Asset {
    idx: string = '33.asset.unit'
    seriesSlug: string = 'wiregrass-basin'
    manifestVersion: string = '1.0.0'
    isParityVerified: boolean = false
    liveTrees: PinnedTrees | null = null
}
