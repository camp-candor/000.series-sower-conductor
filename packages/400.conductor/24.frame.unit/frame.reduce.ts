import clone from 'clone-deep'
import * as Act from './frame.action'
import { FrameModel } from './frame.model'
import * as Buzz from './frame.buzzer'
import State from '../99.core/state'

export function reducer(
    model: FrameModel = new FrameModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_FRAME:
            return Buzz.updateFrame(clone(model), act.bale, state)

        case Act.INIT_FRAME:
            return Buzz.initFrame(clone(model), act.bale, state)

        default:
            return model
    }
}
