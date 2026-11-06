import { Action } from '../99.core/interface/action.interface.js';
import SpeechBit from './fce/speech.bit.js';

export const INIT_SPEECH = '[Speech action] Init Speech';
export class InitSpeech implements Action {
  readonly type = INIT_SPEECH;
  constructor(public bale: SpeechBit) {}
}

export const UPDATE_SPEECH = '[Speech action] Update Speech';
export class UpdateSpeech implements Action {
  readonly type = UPDATE_SPEECH;
  constructor(public bale: SpeechBit) {}
}

export const EXECUTE_SCENE_SPEECH = '[Speech action] Execute Scene Speech';
export class ExecuteSceneSpeech implements Action {
  readonly type = EXECUTE_SCENE_SPEECH;
  constructor(public bale: SpeechBit) {}
}

export type Actions = InitSpeech | UpdateSpeech | ExecuteSceneSpeech;
