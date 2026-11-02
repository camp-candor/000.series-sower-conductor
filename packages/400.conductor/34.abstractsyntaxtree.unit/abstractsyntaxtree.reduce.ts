import clone from 'clone-deep'
import * as Act from './abstractsyntaxtree.action'
import { AbstractsyntaxtreeModel } from './abstractsyntaxtree.model'
import * as Buzz from './abstractsyntaxtree.buzzer'
import State from '../99.core/state'

export function reducer(
    model: AbstractsyntaxtreeModel = new AbstractsyntaxtreeModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_ABSTRACTSYNTAXTREE:
            return Buzz.updateAbstractsyntaxtree(clone(model), act.bale, state)

        case Act.INIT_ABSTRACTSYNTAXTREE:
            return Buzz.initAbstractsyntaxtree(clone(model), act.bale, state)

        default:
            return model
    }
}
