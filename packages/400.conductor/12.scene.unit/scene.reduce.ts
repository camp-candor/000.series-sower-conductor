import clone from 'clone-deep'
import * as Act from './scene.action.js'
import { SceneModel } from './scene.model.js'
import * as Buzz from './scene.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: SceneModel = new SceneModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_SCENE:
            return Buzz.updateScene(clone(model), act.bale, state)

        case Act.INIT_SCENE:
            return Buzz.initScene(clone(model), act.bale, state)

        default:
            return model
    }
}
