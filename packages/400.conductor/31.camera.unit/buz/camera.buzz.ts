import { CameraModel } from '../camera.model.js'
import CameraBit from '../fce/camera.bit.js'
import State from '../../99.core/state.js'

export const initCamera = (cpy: CameraModel, bal: CameraBit, _ste: State) => {
    if (bal.slv) bal.slv({ cameraBit: { idx: 'init-camera', val: 1 } })
    return cpy
}

export const updateCamera = (cpy: CameraModel, bal: CameraBit, _ste: State) => {
    if (bal.slv) bal.slv({ cameraBit: { idx: 'update-camera', val: 1 } })
    return cpy
}
