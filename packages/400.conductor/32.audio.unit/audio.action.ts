import { Action } from '../99.core/interface/action.interface.js'
import AudioBit from './fce/audio.bit.js'

// Audio actions

export const INIT_AUDIO = '[Audio action] Init Audio'
export class InitAudio implements Action {
    readonly type = INIT_AUDIO
    constructor(public bale: AudioBit) {}
}

export const UPDATE_AUDIO = '[Audio action] Update Audio'
export class UpdateAudio implements Action {
    readonly type = UPDATE_AUDIO
    constructor(public bale: AudioBit) {}
}

export type Actions = InitAudio | UpdateAudio
