import { WaveModel } from '../wave.model.js'
import WaveBit from '../fce/wave.bit.js'
import State from '../../99.core/state.js'

export const initWave = (cpy: WaveModel, bal: WaveBit, _ste: State) => {
    if (bal.slv) bal.slv({ waveBit: { idx: 'init-wave', val: 1 } })
    return cpy
}

export const updateWave = (cpy: WaveModel, bal: WaveBit, _ste: State) => {
    if (bal.slv) bal.slv({ waveBit: { idx: 'update-wave', val: 1 } })
    return cpy
}
