import clone from 'clone-deep';
import * as Act from './edgebridge.action.js';
import * as Buzz from './edgebridge.buzzer.js';
import { EdgeBridgeModel } from './edgebridge.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: EdgeBridgeModel = new EdgeBridgeModel(),
  act: Act.Actions,
  state?: State,
) {
  let cpy = clone(model);
  if (!cpy) cpy = new EdgeBridgeModel();

  switch (act.type) {
    case Act.INIT_EDGEBRIDGE:
      return Buzz.initEdgeBridge(cpy, act.bale, state!);
    case Act.ACQUIRE_HARDWARE_LEASE:
      return Buzz.acquireHardwareLease(cpy, act.bale, state!);
    case Act.RENEW_LEASE_HEARTBEAT:
      return Buzz.renewLeaseHeartbeat(cpy, act.bale, state!);
    case Act.TRANSMIT_ASSEMBLY_RECEIPT:
      return Buzz.transmitAssemblyReceipt(cpy, act.bale, state!);
    case Act.TOGGLE_TARGET_ENDPOINT:
      return Buzz.toggleTargetEndpoint(cpy, act.bale, state!);
    case Act.POLL_STALENESS_STATUS:
      return Buzz.pollStalenessStatus(cpy, act.bale, state!);
    default:
      return model;
  }
}
