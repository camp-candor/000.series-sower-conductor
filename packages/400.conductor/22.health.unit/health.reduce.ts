import clone from 'clone-deep'
import * as Act from './health.action'
import { HealthModel } from './health.model'
import * as Buzz from './health.buzzer'
import State from '../99.core/state'

export function reducer(
    model: HealthModel = new HealthModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_HEALTH:
            return Buzz.updateHealth(clone(model), act.bale, state)

        case Act.INIT_HEALTH:
            return Buzz.initHealth(clone(model), act.bale, state)

        default:
            return model
    }
}
