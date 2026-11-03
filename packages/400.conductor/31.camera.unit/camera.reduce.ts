import clone from 'clone-deep'
import * as Act from './camera.action.js'
import { CameraModel } from './camera.model.js'
import * as Buzz from './camera.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: CameraModel = new CameraModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CAMERA:
            return Buzz.updateCamera(clone(model), act.bale, state)

        case Act.INIT_CAMERA:
            return Buzz.initCamera(clone(model), act.bale, state)

        default:
            return model
    }
}
