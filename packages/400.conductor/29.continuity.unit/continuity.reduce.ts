import clone from 'clone-deep'
import * as Act from './continuity.action.js'
import * as Buzz from './continuity.buzzer.js'
import { ContinuityModel } from './continuity.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new ContinuityModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_CONTINUITY:
            return Buzz.initContinuity(cpy, act.bale, state)
        case Act.UPDATE_CONTINUITY:
            return Buzz.updateContinuity(cpy, act.bale, state)
        case Act.EVALUATE_CONTINUITY_GATE:
            return Buzz.evaluateContinuityGate(cpy, act.bale, state)
        default:
            return cpy
    }
}
