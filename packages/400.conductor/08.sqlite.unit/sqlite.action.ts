import { Action } from '../99.core/interface/action.interface'
import SqliteBit from './fce/sqlite.bit'

// Sqlite actions

export const INIT_SQLITE = '[Sqlite action] Init Sqlite'
export class InitSqlite implements Action {
    readonly type = INIT_SQLITE
    constructor(public bale: SqliteBit) {}
}

export const UPDATE_SQLITE = '[Sqlite action] Update Sqlite'
export class UpdateSqlite implements Action {
    readonly type = UPDATE_SQLITE
    constructor(public bale: SqliteBit) {}
}

export type Actions = InitSqlite | UpdateSqlite
