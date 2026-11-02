import { Action } from '../99.core/interface/action.interface'
import AssetBit from './fce/asset.bit'

// Asset actions

export const INIT_ASSET = '[Asset action] Init Asset'
export class InitAsset implements Action {
    readonly type = INIT_ASSET
    constructor(public bale: AssetBit) {}
}

export const UPDATE_ASSET = '[Asset action] Update Asset'
export class UpdateAsset implements Action {
    readonly type = UPDATE_ASSET
    constructor(public bale: AssetBit) {}
}

export type Actions = InitAsset | UpdateAsset
