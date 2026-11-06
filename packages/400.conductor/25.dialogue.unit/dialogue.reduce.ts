import clone from 'clone-deep'
import * as Act from './dialogue.action.js'
import { DialogueModel } from './dialogue.model.js'
import * as Buzz from './dialogue.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: DialogueModel = new DialogueModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_DIALOGUE:
            return Buzz.updateDialogue(clone(model), act.bale, state)
        case Act.INIT_DIALOGUE:
            return Buzz.initDialogue(clone(model), act.bale, state)
        default:
            return model
    }
}
