import { Model } from '../../99.core/interface/model.interface.js'

export interface ISqlitePort {
    exec(sql: string): void
    prepare(sql: string): {
        run(...params: unknown[]): {
            changes: number
            lastInsertRowid: number | bigint
        }
        get(...params: unknown[]): unknown
        all(...params: unknown[]): unknown[]
    }
    transaction<T>(fn: () => T): () => T
    pragma(pragmaStr: string): unknown
    close(): void
    isOpen(): boolean
}

export default interface Sqlite extends Model {
    dbPath: string
    isOpen: boolean
    tableCount: number
    integrity: string
}
