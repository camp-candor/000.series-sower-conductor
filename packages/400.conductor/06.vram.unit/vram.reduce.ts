import clone from 'clone-deep'
import * as Act from './vram.action.js'
import { VramModel } from './vram.model.js'
import * as Buzz from './vram.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: VramModel = new VramModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_VRAM:
            return Buzz.updateVram(clone(model), act.bale, state)

        case Act.INIT_VRAM:
            return Buzz.initVram(clone(model), act.bale, state)

        default:
            return model
    }
}
