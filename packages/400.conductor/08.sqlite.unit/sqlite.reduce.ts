import clone from 'clone-deep'
import * as Act from './sqlite.action.js'
import * as Buzz from './sqlite.buzzer.js'
import { SqliteModel } from './sqlite.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new SqliteModel(),
    act: Act.Actions,
    state?: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_SQLITE:
            return Buzz.initSqlite(cpy, act.bale, state)
        case Act.OPEN_SQLITE_LEDGER:
            return Buzz.openSqliteLedger(cpy, act.bale, state)
        case Act.CLOSE_SQLITE_LEDGER:
            return Buzz.closeSqliteLedger(cpy, act.bale, state)
        default:
            return cpy
    }
}
