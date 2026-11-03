import clone from 'clone-deep'
import * as Act from './speech.action.js'
import * as Buzz from './speech.buzzer.js'
import { SpeechModel } from './speech.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new SpeechModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_SPEECH:
            return Buzz.initSpeech(cpy, act.bale, state)
        case Act.SYNTHESIZE_LINE_AUDIO:
            return Buzz.synthesizeLineAudio(cpy, act.bale, state)
        case Act.SYNTHESIZE_SCENE_AUDIO:
            return Buzz.synthesizeSceneAudio(cpy, act.bale, state)
        default:
            return cpy
    }
}
