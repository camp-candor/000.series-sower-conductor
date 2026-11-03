import clone from 'clone-deep'
import * as Act from './logistics.action.js'
import { LogisticsModel } from './logistics.model.js'
import * as Buzz from './logistics.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: LogisticsModel = new LogisticsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_LOGISTICS:
            return Buzz.updateLogistics(clone(model), act.bale, state)

        case Act.INIT_LOGISTICS:
            return Buzz.initLogistics(clone(model), act.bale, state)

        default:
            return model
    }
}
