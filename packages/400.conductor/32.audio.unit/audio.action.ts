import { Action } from '../99.core/interface/action.interface.js';
import AudioBit from './fce/audio.bit.js';

export const INIT_AUDIO = '[Audio action] Init Audio';
export class InitAudio implements Action {
  readonly type = INIT_AUDIO;
  constructor(public bale: AudioBit) {}
}

export const GENERATE_DUCKING_ENVELOPE = '[Audio action] Generate Ducking Envelope';
export class GenerateDuckingEnvelope implements Action {
  readonly type = GENERATE_DUCKING_ENVELOPE;
  constructor(public bale: AudioBit) {}
}

export const WRITE_EXPOSURE_SHEET = '[Audio action] Write Exposure Sheet';
export class WriteExposureSheet implements Action {
  readonly type = WRITE_EXPOSURE_SHEET;
  constructor(public bale: AudioBit) {}
}

export type Actions = InitAudio | GenerateDuckingEnvelope | WriteExposureSheet;
