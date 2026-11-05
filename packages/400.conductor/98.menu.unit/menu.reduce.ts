import clone from 'clone-deep';
import * as Act from './menu.action.js';
import * as Buzz from './menu.buzzer.js';
import { MenuModel } from './menu.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: MenuModel = new MenuModel(),
  act: Act.Actions,
  state?: State,
) {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_MENU:
      return Buzz.initMenu(cpy, act.bale, state!);
    case Act.UPDATE_MENU:
      return Buzz.updateMenu(cpy, act.bale, state!);
    case Act.STAMP_REMOTION_MENU:
      return Buzz.stampRemotionMenu(cpy, act.bale, state!);
    case Act.VERIFY_REMOTION_MENU:
      return Buzz.verifyRemotionMenu(cpy, act.bale, state!);
    case Act.TOGGLE_EDGE_MENU:
      return Buzz.toggleEdgeMenu(cpy, act.bale, state!);
    case Act.PING_EDGE_MENU:
      return Buzz.pingEdgeMenu(cpy, act.bale, state!);
    case Act.LEASE_EDGE_MENU:
      return Buzz.leaseEdgeMenu(cpy, act.bale, state!);
    case Act.STALENESS_EDGE_MENU:
      return Buzz.stalenessEdgeMenu(cpy, act.bale, state!);
    case Act.TRANSMIT_EDGE_MENU:
      return Buzz.transmitEdgeMenu(cpy, act.bale, state!);
    default:
      return model;
  }
}
