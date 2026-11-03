import clone from 'clone-deep'
import * as Act from './logistic.action.js'
import { LogisticModel } from './logistic.model.js'
import * as Buzz from './logistic.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: LogisticModel = new LogisticModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_LOGISTIC:
            return Buzz.updateLogistic(clone(model), act.bale, state)

        case Act.INIT_LOGISTIC:
            return Buzz.initLogistic(clone(model), act.bale, state)

        default:
            return model
    }
}
