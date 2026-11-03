import clone from 'clone-deep'
import * as Act from './character.action.js'
import { CharacterModel } from './character.model.js'
import * as Buzz from './character.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: CharacterModel = new CharacterModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CHARACTER:
            return Buzz.updateCharacter(clone(model), act.bale, state)

        case Act.INIT_CHARACTER:
            return Buzz.initCharacter(clone(model), act.bale, state)

        default:
            return model
    }
}
