import clone from 'clone-deep'
import * as Act from './vram.action.js'
import * as Buzz from './vram.buzzer.js'
import { VramModel } from './vram.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new VramModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_VRAM:
            return Buzz.initVram(cpy, act.bale, state)
        case Act.EXECUTE_VRAM_HYGIENE:
            return Buzz.executeVramHygiene(cpy, act.bale, state)
        default:
            return cpy
    }
}
