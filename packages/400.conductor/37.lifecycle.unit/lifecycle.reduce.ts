import clone from 'clone-deep';
import * as Act from './lifecycle.action.js';
import { LifecycleModel } from './lifecycle.model.js';
import * as Buzz from './lifecycle.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: LifecycleModel = new LifecycleModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_LIFECYCLE:
      return Buzz.initLifecycle(clone(model), act.bale, state!);

    case Act.UPDATE_LIFECYCLE:
      return Buzz.updateLifecycle(clone(model), act.bale, state!);

    case Act.CHAIN_MASTER_SCENE_LIFECYCLE:
      return Buzz.chainMasterSceneLifecycleBuzz(clone(model), act.bale, state!);

    default:
      return model;
  }
}
