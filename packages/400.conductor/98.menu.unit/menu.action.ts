import { Action } from '../99.core/interface/action.interface.js'
import MenuBit from './fce/menu.bit.js'

export const INIT_MENU = '[Menu action] Init Menu'
export class InitMenu implements Action {
    readonly type = INIT_MENU
    constructor(public bale: MenuBit) {}
}

export const UPDATE_MENU = '[Menu action] Update Menu'
export class UpdateMenu implements Action {
    readonly type = UPDATE_MENU
    constructor(public bale: MenuBit) {}
}

export const DISPATCH_REMOTE_AUDIO_PIVOT =
    '[Menu action] Dispatch Remote Audio Pivot'
export class DispatchRemoteAudioPivot implements Action {
    readonly type = DISPATCH_REMOTE_AUDIO_PIVOT
    constructor(public bale: MenuBit) {}
}

export const AUDIT_CONDUCTOR_TIMECODE = '[Menu action] Audit Conductor Timecode'
export class AuditConductorTimecode implements Action {
    readonly type = AUDIT_CONDUCTOR_TIMECODE
    constructor(public bale: MenuBit) {}
}

export const BATCH_INGEST_AUTO_SCRIPT_STACK =
    '[Menu action] Batch Ingest Auto-Script Stack'
export class BatchIngestAutoScriptStack implements Action {
    readonly type = BATCH_INGEST_AUTO_SCRIPT_STACK
    constructor(public bale: MenuBit) {}
}

export const AUDIT_CONDUCTOR_CHRONO_AGENDA =
    '[Menu action] Audit Conductor Chrono Agenda'
export class AuditConductorChronoAgenda implements Action {
    readonly type = AUDIT_CONDUCTOR_CHRONO_AGENDA
    constructor(public bale: MenuBit) {}
}

export type Actions =
    | InitMenu
    | UpdateMenu
    | DispatchRemoteAudioPivot
    | AuditConductorTimecode
    | BatchIngestAutoScriptStack
    | AuditConductorChronoAgenda
