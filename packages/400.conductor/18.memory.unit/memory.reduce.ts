import clone from 'clone-deep'
import * as Act from './memory.action'
import { MemoryModel } from './memory.model'
import * as Buzz from './memory.buzzer'
import State from '../99.core/state'

export function reducer(
    model: MemoryModel = new MemoryModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_MEMORY:
            return Buzz.updateMemory(clone(model), act.bale, state)

        case Act.INIT_MEMORY:
            return Buzz.initMemory(clone(model), act.bale, state)

        default:
            return model
    }
}
