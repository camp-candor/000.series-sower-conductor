import clone from 'clone-deep'
import * as Act from './sqlite.action'
import { SqliteModel } from './sqlite.model'
import * as Buzz from './sqlite.buzzer'
import State from '../99.core/state'

export function reducer(
    model: SqliteModel = new SqliteModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_SQLITE:
            return Buzz.updateSqlite(clone(model), act.bale, state)

        case Act.INIT_SQLITE:
            return Buzz.initSqlite(clone(model), act.bale, state)

        default:
            return model
    }
}
