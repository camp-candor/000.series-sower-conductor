import { Action } from '../99.core/interface/action.interface.js'
import SpeechBit from './fce/speech.bit.js'

export const INIT_SPEECH = '[Speech action] Init Speech'
export class InitSpeech implements Action {
    readonly type = INIT_SPEECH
    constructor(public bale: SpeechBit) {}
}

export const SYNTHESIZE_LINE_AUDIO = '[Speech action] Synthesize Line Audio'
export class SynthesizeLineAudio implements Action {
    readonly type = SYNTHESIZE_LINE_AUDIO
    constructor(public bale: SpeechBit) {}
}

export const SYNTHESIZE_SCENE_AUDIO = '[Speech action] Synthesize Scene Audio'
export class SynthesizeSceneAudio implements Action {
    readonly type = SYNTHESIZE_SCENE_AUDIO
    constructor(public bale: SpeechBit) {}
}

export type Actions = InitSpeech | SynthesizeLineAudio | SynthesizeSceneAudio
