import clone from 'clone-deep'
import * as Act from './continuity.action'
import { ContinuityModel } from './continuity.model'
import * as Buzz from './continuity.buzzer'
import State from '../99.core/state'

export function reducer(
    model: ContinuityModel = new ContinuityModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CONTINUITY:
            return Buzz.updateContinuity(clone(model), act.bale, state)

        case Act.INIT_CONTINUITY:
            return Buzz.initContinuity(clone(model), act.bale, state)

        default:
            return model
    }
}
