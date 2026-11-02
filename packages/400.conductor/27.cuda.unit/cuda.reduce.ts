import clone from 'clone-deep'
import * as Act from './cuda.action'
import { CudaModel } from './cuda.model'
import * as Buzz from './cuda.buzzer'
import State from '../99.core/state'

export function reducer(
    model: CudaModel = new CudaModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CUDA:
            return Buzz.updateCuda(clone(model), act.bale, state)

        case Act.INIT_CUDA:
            return Buzz.initCuda(clone(model), act.bale, state)

        default:
            return model
    }
}
