import clone from 'clone-deep'
import * as Act from './wave.action'
import { WaveModel } from './wave.model'
import * as Buzz from './wave.buzzer'
import State from '../99.core/state'

export function reducer(
    model: WaveModel = new WaveModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_WAVE:
            return Buzz.updateWave(clone(model), act.bale, state)

        case Act.INIT_WAVE:
            return Buzz.initWave(clone(model), act.bale, state)

        default:
            return model
    }
}
