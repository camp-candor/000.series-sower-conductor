import clone from 'clone-deep'
import * as Act from './somaticdsp.action'
import { SomaticdspModel } from './somaticdsp.model'
import * as Buzz from './somaticdsp.buzzer'
import State from '../99.core/state'

export function reducer(
    model: SomaticdspModel = new SomaticdspModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_SOMATICDSP:
            return Buzz.updateSomaticdsp(clone(model), act.bale, state)

        case Act.INIT_SOMATICDSP:
            return Buzz.initSomaticdsp(clone(model), act.bale, state)

        default:
            return model
    }
}
