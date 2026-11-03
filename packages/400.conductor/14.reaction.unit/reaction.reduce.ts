import clone from 'clone-deep'
import * as Act from './reaction.action.js'
import { ReactionModel } from './reaction.model.js'
import * as Buzz from './reaction.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: ReactionModel = new ReactionModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_REACTION:
            return Buzz.updateReaction(clone(model), act.bale, state)

        case Act.INIT_REACTION:
            return Buzz.initReaction(clone(model), act.bale, state)

        default:
            return model
    }
}
