import clone from 'clone-deep'
import * as Act from './laws.action.js'
import { LawsModel } from './laws.model.js'
import * as Buzz from './laws.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: LawsModel = new LawsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_LAWS:
            return Buzz.updateLaws(clone(model), act.bale, state)

        case Act.INIT_LAWS:
            return Buzz.initLaws(clone(model), act.bale, state)

        default:
            return model
    }
}
