import clone from 'clone-deep';
import * as Act from './somaticdsp.action.js';
import * as Buzz from './somaticdsp.buzzer.js';
import { SomaticdspModel } from './somaticdsp.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: SomaticdspModel = new SomaticdspModel(),
  act: Act.Actions,
  state?: State,
) {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_SOMATICDSP:
      return Buzz.initSomaticdsp(cpy, act.bale, state!);
    case Act.TRANSLATE_SOMATIC_DSP:
      return Buzz.translateSomaticDsp(cpy, act.bale, state!);
    default:
      return model;
  }
}
