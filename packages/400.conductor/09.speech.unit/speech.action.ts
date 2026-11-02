import { Action } from '../99.core/interface/action.interface'
import SpeechBit from './fce/speech.bit'

// Speech actions

export const INIT_SPEECH = '[Speech action] Init Speech'
export class InitSpeech implements Action {
    readonly type = INIT_SPEECH
    constructor(public bale: SpeechBit) {}
}

export const UPDATE_SPEECH = '[Speech action] Update Speech'
export class UpdateSpeech implements Action {
    readonly type = UPDATE_SPEECH
    constructor(public bale: SpeechBit) {}
}

export type Actions = InitSpeech | UpdateSpeech
