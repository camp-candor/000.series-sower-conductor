import { Action } from '../99.core/interface/action.interface'
import WaveBit from './fce/wave.bit'

// Wave actions

export const INIT_WAVE = '[Wave action] Init Wave'
export class InitWave implements Action {
    readonly type = INIT_WAVE
    constructor(public bale: WaveBit) {}
}

export const UPDATE_WAVE = '[Wave action] Update Wave'
export class UpdateWave implements Action {
    readonly type = UPDATE_WAVE
    constructor(public bale: WaveBit) {}
}

export type Actions = InitWave | UpdateWave
