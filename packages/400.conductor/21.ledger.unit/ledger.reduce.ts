import clone from 'clone-deep'
import * as Act from './ledger.action.js'
import * as Buzz from './ledger.buzzer.js'
import { LedgerModel } from './ledger.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new LedgerModel(),
    act: Act.Actions,
    state?: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_LEDGER:
            return Buzz.initLedger(cpy, act.bale, state)
        case Act.INSERT_FACT:
            return Buzz.insertFact(cpy, act.bale, state)
        case Act.BUMP_FACT_VERSION:
            return Buzz.bumpFactVersion(cpy, act.bale, state)
        case Act.REGISTER_SCENE_DEPENDENCY:
            return Buzz.registerSceneDependency(cpy, act.bale, state)
        case Act.APPEND_EVENT:
            return Buzz.appendEvent(cpy, act.bale, state)
        default:
            return cpy
    }
}
