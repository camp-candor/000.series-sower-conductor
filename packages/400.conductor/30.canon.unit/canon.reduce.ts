import clone from 'clone-deep'
import * as Act from './canon.action.js'
import * as Buzz from './canon.buzzer.js'
import { CanonModel } from './canon.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new CanonModel(),
    act: Act.Actions,
    state: State,
) => {
    switch (act.type) {
        case Act.INIT_CANON:
            return Buzz.initCanon(clone(model), act.bale, state)
        case Act.LOAD_CANON_AND_FREEZE:
            return Buzz.loadCanonAndFreeze(clone(model), act.bale, state)
        default:
            return model
    }
}
