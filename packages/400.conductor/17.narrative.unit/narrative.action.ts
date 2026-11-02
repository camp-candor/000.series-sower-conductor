import { Action } from '../99.core/interface/action.interface'
import NarrativeBit from './fce/narrative.bit'

// Narrative actions

export const INIT_NARRATIVE = '[Narrative action] Init Narrative'
export class InitNarrative implements Action {
    readonly type = INIT_NARRATIVE
    constructor(public bale: NarrativeBit) {}
}

export const UPDATE_NARRATIVE = '[Narrative action] Update Narrative'
export class UpdateNarrative implements Action {
    readonly type = UPDATE_NARRATIVE
    constructor(public bale: NarrativeBit) {}
}

export type Actions = InitNarrative | UpdateNarrative
