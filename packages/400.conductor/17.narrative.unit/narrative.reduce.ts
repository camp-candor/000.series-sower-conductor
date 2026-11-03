import clone from 'clone-deep'
import * as Act from './narrative.action.js'
import { NarrativeModel } from './narrative.model.js'
import * as Buzz from './narrative.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: NarrativeModel = new NarrativeModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_NARRATIVE:
            return Buzz.updateNarrative(clone(model), act.bale, state)

        case Act.INIT_NARRATIVE:
            return Buzz.initNarrative(clone(model), act.bale, state)

        default:
            return model
    }
}
