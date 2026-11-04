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

export const STAMP_REMOTION_MENU = '[Menu action] Stamp Remotion Menu'
export class StampRemotionMenu implements Action {
    readonly type = STAMP_REMOTION_MENU
    constructor(public bale: MenuBit) {}
}

export const VERIFY_REMOTION_MENU = '[Menu action] Verify Remotion Menu'
export class VerifyRemotionMenu implements Action {
    readonly type = VERIFY_REMOTION_MENU
    constructor(public bale: MenuBit) {}
}

export type Actions =
    InitMenu | UpdateMenu | StampRemotionMenu | VerifyRemotionMenu
