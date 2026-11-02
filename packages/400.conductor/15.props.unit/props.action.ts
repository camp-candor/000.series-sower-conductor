import { Action } from '../99.core/interface/action.interface'
import PropsBit from './fce/props.bit'

// Props actions

export const INIT_PROPS = '[Props action] Init Props'
export class InitProps implements Action {
    readonly type = INIT_PROPS
    constructor(public bale: PropsBit) {}
}

export const UPDATE_PROPS = '[Props action] Update Props'
export class UpdateProps implements Action {
    readonly type = UPDATE_PROPS
    constructor(public bale: PropsBit) {}
}

export type Actions = InitProps | UpdateProps
