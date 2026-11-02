import clone from 'clone-deep'
import * as Act from './speech.action'
import { SpeechModel } from './speech.model'
import * as Buzz from './speech.buzzer'
import State from '../99.core/state'

export function reducer(
    model: SpeechModel = new SpeechModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_SPEECH:
            return Buzz.updateSpeech(clone(model), act.bale, state)

        case Act.INIT_SPEECH:
            return Buzz.initSpeech(clone(model), act.bale, state)

        default:
            return model
    }
}
