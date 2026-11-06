// packages/400.conductor/32.audio.unit/audio.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import AudioBit from './fce/audio.bit.js';

export const INIT_AUDIO = '[Audio action] Init Audio';
export class InitAudio implements Action {
  readonly type = INIT_AUDIO;
  constructor(public bale: AudioBit) {}
}

export const UPDATE_AUDIO = '[Audio action] Update Audio';
export class UpdateAudio implements Action {
  readonly type = UPDATE_AUDIO;
  constructor(public bale: AudioBit) {}
}

export const ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET = '[Audio action] Assemble Acoustic Exposure Sheet';
export class AssembleAcousticExposureSheet implements Action {
  readonly type = ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET;
  constructor(public bale: AudioBit) {}
}

export type Actions = InitAudio | UpdateAudio | AssembleAcousticExposureSheet;
