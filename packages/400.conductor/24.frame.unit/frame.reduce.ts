import clone from 'clone-deep';
import * as Act from './frame.action.js';
import * as Buzz from './frame.buzzer.js';
import { FrameModel } from './frame.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: FrameModel = new FrameModel(),
  act: Act.Actions,
  state?: State,
) {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_FRAME:
      return Buzz.initFrame(cpy, act.bale, state!);
    case Act.QUANTIZE_STEM_DURATION:
      return Buzz.quantizeStemDuration(cpy, act.bale, state!);
    case Act.COMPILE_TIMELINE_BUDGET:
      return Buzz.compileTimelineBudget(cpy, act.bale, state!);
    default:
      return model;
  }
}
