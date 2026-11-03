import { Action } from '../99.core/interface/action.interface.js'
import ConductorBit from './fce/conductor.bit.js'

// conductor actions

export const INIT_CONDUCTOR = '[Conductor action] Init Conductor'
export class InitConductor implements Action {
    readonly type = INIT_CONDUCTOR
    constructor(public bale: ConductorBit) {}
}

export const UPDATE_CONDUCTOR = '[Conductor action] Update Conductor'
export class UpdateConductor implements Action {
    readonly type = UPDATE_CONDUCTOR
    constructor(public bale: ConductorBit) {}
}

export const TEST_CONDUCTOR = '[Test action] Test Conductor'
export class TestConductor implements Action {
    readonly type = TEST_CONDUCTOR
    constructor(public bale: ConductorBit) {}
}

export const INTELLECT_CONDUCTOR = '[Intellect action] Intellect Conductor'
export class IntellectConductor implements Action {
    readonly type = INTELLECT_CONDUCTOR
    constructor(public bale: ConductorBit) {}
}

export const VISION_CONDUCTOR = '[Vision action] Vision Conductor'
export class VisionConductor implements Action {
    readonly type = VISION_CONDUCTOR
    constructor(public bale: ConductorBit) {}
}

export const LIST_CONDUCTOR = '[List action] List Conductor'
export class ListConductor implements Action {
    readonly type = LIST_CONDUCTOR
    constructor(public bale: ConductorBit) {}
}

export const RUN_SCENE_LIFECYCLE = '[Conductor action] Run Scene Lifecycle'
export class RunSceneLifecycle implements Action {
    readonly type = RUN_SCENE_LIFECYCLE
    constructor(public bale: ConductorBit) {}
}

export type Actions =
    | InitConductor
    | RunSceneLifecycle
    | UpdateConductor
    | TestConductor
    | IntellectConductor
    | VisionConductor
    | ListConductor
