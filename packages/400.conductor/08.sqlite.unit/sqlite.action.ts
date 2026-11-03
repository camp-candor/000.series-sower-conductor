import { Action } from '../99.core/interface/action.interface.js'
import SqliteBit from './fce/sqlite.bit.js'

export const INIT_SQLITE = '[Sqlite action] Init Sqlite'
export class InitSqlite implements Action {
    readonly type = INIT_SQLITE
    constructor(public bale: SqliteBit) {}
}

export const OPEN_SQLITE_LEDGER = '[Sqlite action] Open Sqlite Ledger'
export class OpenSqliteLedger implements Action {
    readonly type = OPEN_SQLITE_LEDGER
    constructor(public bale: SqliteBit) {}
}

export const CLOSE_SQLITE_LEDGER = '[Sqlite action] Close Sqlite Ledger'
export class CloseSqliteLedger implements Action {
    readonly type = CLOSE_SQLITE_LEDGER
    constructor(public bale: SqliteBit) {}
}

export type Actions = InitSqlite | OpenSqliteLedger | CloseSqliteLedger
