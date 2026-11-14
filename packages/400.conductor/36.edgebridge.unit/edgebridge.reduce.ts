import * as Act from './edgebridge.action.js'
import { EdgebridgeModel } from './edgebridge.model.js'
import * as Buzz from './edgebridge.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: EdgebridgeModel = new EdgebridgeModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.INIT_EDGEBRIDGE:
            return Buzz.initEdgebridge(model, act.bale, state!)

        case Act.UPDATE_EDGEBRIDGE:
            return Buzz.updateEdgebridge(model, act.bale, state!)

        case Act.ACQUIRE_HARDWARE_LEASE:
            return Buzz.acquireHardwareLease(model, act.bale, state!)

        case Act.SYNC_EDGE_TELEMETRY:
            return Buzz.syncEdgeTelemetry(model, act.bale, state!)

        case Act.RENEW_LEASE_HEARTBEAT:
            return Buzz.renewLeaseHeartbeat(model, act.bale, state!)

        case Act.TRANSMIT_ASSEMBLY_RECEIPT:
            return Buzz.transmitAssemblyReceipt(model, act.bale, state!)

        case Act.TOGGLE_TARGET_ENDPOINT:
            return Buzz.toggleTargetEndpoint(model, act.bale, state!)

        case Act.POLL_STALENESS_STATUS:
            return Buzz.pollStalenessStatus(model, act.bale, state!)

        default:
            return model
    }
}
