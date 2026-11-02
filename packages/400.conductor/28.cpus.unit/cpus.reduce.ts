import clone from 'clone-deep'
import * as Act from './cpus.action'
import { CpusModel } from './cpus.model'
import * as Buzz from './cpus.buzzer'
import State from '../99.core/state'

export function reducer(
    model: CpusModel = new CpusModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CPUS:
            return Buzz.updateCpus(clone(model), act.bale, state)

        case Act.INIT_CPUS:
            return Buzz.initCpus(clone(model), act.bale, state)

        default:
            return model
    }
}
