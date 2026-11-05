import clone from 'clone-deep';
import * as Act from './remotion.action.js';
import * as Buzz from './remotion.buzzer.js';
import { RemotionModel } from './remotion.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: RemotionModel = new RemotionModel(),
  act: Act.Actions,
  state?: State
) {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_REMOTION:
      return Buzz.initRemotion(cpy, act.bale, state!);
    case Act.UPDATE_REMOTION:
      return Buzz.updateRemotion(cpy, act.bale, state!);
    case Act.STAMP_STATIC_COMPOSITION:
      return Buzz.stampStaticCompositionBuzz(cpy, act.bale, state!);
    case Act.RENDER_SWANGLE:
      return Buzz.renderSwangleBuzz(cpy, act.bale, state!);
    default:
      return model;
  }
}
