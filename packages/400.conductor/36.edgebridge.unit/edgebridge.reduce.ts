import clone from 'clone-deep'
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
            return Buzz.initEdgebridge(clone(model), act.bale, state!)

        case Act.UPDATE_EDGEBRIDGE:
            return Buzz.updateEdgebridge(clone(model), act.bale, state!)

        case Act.ACQUIRE_HARDWARE_LEASE:
            return Buzz.acquireHardwareLease(clone(model), act.bale, state!)

        case Act.SYNC_EDGE_TELEMETRY:
            return Buzz.syncEdgeTelemetry(clone(model), act.bale, state!)

        case Act.RENEW_LEASE_HEARTBEAT:
            return Buzz.renewLeaseHeartbeat(clone(model), act.bale, state!)

        case Act.TRANSMIT_ASSEMBLY_RECEIPT:
            return Buzz.transmitAssemblyReceipt(clone(model), act.bale, state!)

        case Act.TOGGLE_TARGET_ENDPOINT:
            return Buzz.toggleTargetEndpoint(clone(model), act.bale, state!)

        case Act.POLL_STALENESS_STATUS:
            return Buzz.pollStalenessStatus(clone(model), act.bale, state!)

        default:
            return model
    }
}
