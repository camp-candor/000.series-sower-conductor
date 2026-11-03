import clone from 'clone-deep'
import * as Act from './cuda.action.js'
import * as Buzz from './cuda.buzzer.js'
import { CudaModel } from './cuda.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new CudaModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_CUDA:
            return Buzz.initCuda(cpy, act.bale, state)
        case Act.ASSERT_ZERO_VRAM:
            return Buzz.assertZeroVram(cpy, act.bale, state)
        default:
            return cpy
    }
}
