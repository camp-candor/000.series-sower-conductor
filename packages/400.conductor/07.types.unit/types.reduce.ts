import clone from 'clone-deep'
import * as Act from './types.action.js'
import { TypesModel } from './types.model.js'
import * as Buzz from './types.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: TypesModel = new TypesModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_TYPES:
            return Buzz.updateTypes(clone(model), act.bale, state)

        case Act.INIT_TYPES:
            return Buzz.initTypes(clone(model), act.bale, state)

        default:
            return model
    }
}
