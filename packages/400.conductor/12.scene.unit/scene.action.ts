import { Action } from '../99.core/interface/action.interface.js'
import SceneBit from './fce/scene.bit.js'

// Scene actions

export const INIT_SCENE = '[Scene action] Init Scene'
export class InitScene implements Action {
    readonly type = INIT_SCENE
    constructor(public bale: SceneBit) {}
}

export const UPDATE_SCENE = '[Scene action] Update Scene'
export class UpdateScene implements Action {
    readonly type = UPDATE_SCENE
    constructor(public bale: SceneBit) {}
}

export const PARSE_SCENE_TRANSITIONS = '[Scene action] Parse Scene Transitions'
export class ParseSceneTransitions implements Action {
    readonly type = PARSE_SCENE_TRANSITIONS
    constructor(public bale: SceneBit) {}
}

export type Actions = InitScene | UpdateScene | ParseSceneTransitions
