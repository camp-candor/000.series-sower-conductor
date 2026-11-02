import clone from 'clone-deep'
import * as Act from './asset.action'
import { AssetModel } from './asset.model'
import * as Buzz from './asset.buzzer'
import State from '../99.core/state'

export function reducer(
    model: AssetModel = new AssetModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_ASSET:
            return Buzz.updateAsset(clone(model), act.bale, state)

        case Act.INIT_ASSET:
            return Buzz.initAsset(clone(model), act.bale, state)

        default:
            return model
    }
}
