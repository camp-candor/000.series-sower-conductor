import Sqlite from './fce/sqlite.interface.js'

export class SqliteModel implements Sqlite {
    idx: string = '08.sqlite.unit'
    dbPath: string = 'data/sqlite/pilot.db'
    isOpen: boolean = false
    tableCount: number = 0
    integrity: string = 'UNKNOWN'
}
