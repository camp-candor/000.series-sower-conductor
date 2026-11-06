import clone from 'clone-deep'
import * as Act from './asset.action.js'
import * as Buzz from './asset.buzzer.js'
import { AssetModel } from './asset.model.js'
import State from '../99.core/state.js'

export function reducer(
    model: AssetModel = new AssetModel(),
    act: Act.Actions,
    state?: State,
) {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_ASSET:
            return Buzz.initAsset(cpy, act.bale, state!)
        case Act.VERIFY_ASSET_PARITY:
            return Buzz.verifyAssetTreeParity(cpy, act.bale, state!)
        case Act.VALIDATE_CHARACTER_PLATE:
            return Buzz.validateCharacterPlate(cpy, act.bale, state!)
        default:
            return model
    }
}
