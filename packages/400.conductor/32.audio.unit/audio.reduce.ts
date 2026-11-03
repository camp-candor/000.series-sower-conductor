import clone from 'clone-deep';
import * as Act from './audio.action.js';
import * as Buzz from './audio.buzzer.js';
import { AudioModel } from './audio.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: AudioModel = new AudioModel(),
  act: Act.Actions,
  state?: State,
) {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_AUDIO:
      return Buzz.initAudio(cpy, act.bale, state!);
    case Act.GENERATE_DUCKING_ENVELOPE:
      return Buzz.generateDuckingEnvelope(cpy, act.bale, state!);
    case Act.WRITE_EXPOSURE_SHEET:
      return Buzz.writeExposureSheet(cpy, act.bale, state!);
    default:
      return model;
  }
}
