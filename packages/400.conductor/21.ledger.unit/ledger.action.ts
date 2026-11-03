import { Action } from '../99.core/interface/action.interface.js'
import LedgerBit from './fce/ledger.bit.js'

export const INIT_LEDGER = '[Ledger action] Init Ledger'
export class InitLedger implements Action {
    readonly type = INIT_LEDGER
    constructor(public bale: LedgerBit) {}
}

export const INSERT_FACT = '[Ledger action] Insert Fact'
export class InsertFact implements Action {
    readonly type = INSERT_FACT
    constructor(public bale: LedgerBit) {}
}

export const BUMP_FACT_VERSION = '[Ledger action] Bump Fact Version'
export class BumpFactVersion implements Action {
    readonly type = BUMP_FACT_VERSION
    constructor(public bale: LedgerBit) {}
}

export const REGISTER_SCENE_DEPENDENCY =
    '[Ledger action] Register Scene Dependency'
export class RegisterSceneDependency implements Action {
    readonly type = REGISTER_SCENE_DEPENDENCY
    constructor(public bale: LedgerBit) {}
}

export const APPEND_EVENT = '[Ledger action] Append Event'
export class AppendEvent implements Action {
    readonly type = APPEND_EVENT
    constructor(public bale: LedgerBit) {}
}

export type Actions =
    | InitLedger
    | InsertFact
    | BumpFactVersion
    | RegisterSceneDependency
    | AppendEvent
