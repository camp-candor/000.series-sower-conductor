import clone from 'clone-deep'
import * as Act from './conductor.action.js'
import { ConductorModel } from './conductor.model.js'
import * as Buzz from './conductor.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: ConductorModel = new ConductorModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CONDUCTOR:
            return Buzz.updateConductor(clone(model), act.bale, state)

        case Act.INIT_CONDUCTOR:
            return Buzz.initConductor(clone(model), act.bale, state)

        case Act.RUN_SCENE_LIFECYCLE:
            return Buzz.runSceneLifecycle(clone(model), act.bale, state)

        case Act.TEST_CONDUCTOR:
            return Buzz.testConductor(clone(model), act.bale, state)

        case Act.LIST_CONDUCTOR:
            return Buzz.listConductor(clone(model), act.bale, state)

        default:
            return model
    }
}
