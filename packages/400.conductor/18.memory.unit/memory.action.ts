import { Action } from '../99.core/interface/action.interface'
import MemoryBit from './fce/memory.bit'

// Memory actions

export const INIT_MEMORY = '[Memory action] Init Memory'
export class InitMemory implements Action {
    readonly type = INIT_MEMORY
    constructor(public bale: MemoryBit) {}
}

export const UPDATE_MEMORY = '[Memory action] Update Memory'
export class UpdateMemory implements Action {
    readonly type = UPDATE_MEMORY
    constructor(public bale: MemoryBit) {}
}

export type Actions = InitMemory | UpdateMemory
