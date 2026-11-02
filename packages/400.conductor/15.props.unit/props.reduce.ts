import clone from 'clone-deep'
import * as Act from './props.action'
import { PropsModel } from './props.model'
import * as Buzz from './props.buzzer'
import State from '../99.core/state'

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
