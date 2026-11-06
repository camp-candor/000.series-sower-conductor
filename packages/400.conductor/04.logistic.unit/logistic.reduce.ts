import clone from 'clone-deep'
import * as Act from './logistic.action.js'
import * as Buzz from './logistic.buzzer.js'
import { LogisticModel } from './logistic.model.js'
import State from '../99.core/state.js'

export function reducer(
    model: LogisticModel = new LogisticModel(),
    act: Act.Actions,
    state?: State,
) {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_LOGISTIC:
            return Buzz.initLogistic(cpy, act.bale, state!)
        case Act.COMPILE_SPOKE_PAYLOAD:
            return Buzz.compileSpokePayload(cpy, act.bale, state!)
        case Act.DISPATCH_SPOKE_PAYLOAD:
            return Buzz.dispatchSpokePayload(cpy, act.bale, state!)
        default:
            return model
    }
}
