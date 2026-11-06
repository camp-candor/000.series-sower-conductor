import clone from 'clone-deep';
import * as Act from './speech.action.js';
import { SpeechModel } from './speech.model.js';
import * as Buzz from './speech.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: SpeechModel = new SpeechModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_SPEECH:
      return Buzz.initSpeech(clone(model), act.bale, state!);

    case Act.UPDATE_SPEECH:
      return Buzz.updateSpeech(clone(model), act.bale, state!);

    case Act.EXECUTE_SCENE_SPEECH:
      return Buzz.executeSceneSpeech(clone(model), act.bale, state!);

    default:
      return model;
  }
}
