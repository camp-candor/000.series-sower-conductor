import clone from 'clone-deep';
import * as Act from './conductor.action.js';
import * as Buzz from './conductor.buzzer.js';
import { ConductorModel } from './conductor.model.js';
import State from '../99.core/state.js';

export const reducer = (model: any = new ConductorModel(), act: Act.Actions, state: State) => {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_CONDUCTOR:
      return Buzz.initConductor(cpy, act.bale, state);
    case Act.RUN_SCENE_LIFECYCLE:
      return Buzz.runSceneLifecycle(cpy, act.bale, state);
    default:
      return cpy;
  }
};

