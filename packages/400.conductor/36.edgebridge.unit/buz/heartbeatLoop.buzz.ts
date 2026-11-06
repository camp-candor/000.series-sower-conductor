import { EdgebridgeModel } from '../edgebridge.model.js'
import EdgebridgeBit from '../fce/edgebridge.bit.js'
import State from '../../99.core/state.js'

export const startHeartbeatLoop = (
    cpy: EdgebridgeModel,
    bal: EdgebridgeBit,
    ste: State,
): EdgebridgeModel => {
    cpy.isHeartbeatActive = true
    if (bal.slv != null) {
        bal.slv({ edgBit: { idx: 'start-heartbeat-loop', val: 1 } })
    }
    return cpy
}

export const stopHeartbeatLoop = (
    cpy: EdgebridgeModel,
    bal: EdgebridgeBit,
    ste: State,
): EdgebridgeModel => {
    cpy.isHeartbeatActive = false
    if (bal.slv != null) {
        bal.slv({ edgBit: { idx: 'stop-heartbeat-loop', val: 1 } })
    }
    return cpy
}
