import clone from 'clone-deep'
import * as Act from './props.action.js'
import { PropsModel } from './props.model.js'
import * as Buzz from './props.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: PropsModel = new PropsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_PROPS:
            return Buzz.updateProps(clone(model), act.bale, state)

        case Act.INIT_PROPS:
            return Buzz.initProps(clone(model), act.bale, state)

        default:
            return model
    }
}
