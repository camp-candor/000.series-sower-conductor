import { Action } from '../99.core/interface/action.interface.js'
import AssetBit from './fce/asset.bit.js'

export const INIT_ASSET = '[Asset action] Init Asset'
export class InitAsset implements Action {
    readonly type = INIT_ASSET
    constructor(public bale: AssetBit) {}
}

export const VERIFY_ASSET_PARITY = '[Asset action] Verify Asset Parity'
export class VerifyAssetParity implements Action {
    readonly type = VERIFY_ASSET_PARITY
    constructor(public bale: AssetBit) {}
}

export type Actions = InitAsset | VerifyAssetParity
