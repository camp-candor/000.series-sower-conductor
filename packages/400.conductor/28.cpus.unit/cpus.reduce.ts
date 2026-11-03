import clone from 'clone-deep'
import * as Act from './cpus.action.js'
import * as Buzz from './cpus.buzzer.js'
import { CpusModel } from './cpus.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new CpusModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_CPUS:
            return Buzz.initCpus(cpy, act.bale, state)
        case Act.VERIFY_HARDWARE_PREFLIGHT:
            return Buzz.verifyHardwarePreflight(cpy, act.bale, state)
        default:
            return cpy
    }
}
