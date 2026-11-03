import { AudioModel } from '../audio.model.js';
import AudioBit from '../fce/audio.bit.js';
import State from '../../99.core/state.js';

export const initAudio = (cpy: AudioModel, bal: AudioBit, _ste: State) => {
  if (bal.slv) bal.slv({ audioBit: { idx: 'init-audio', val: 1 } });
  return cpy;
};

export const updateAudio = (cpy: AudioModel, bal: AudioBit, _ste: State) => {
  if (bal.slv) bal.slv({ audioBit: { idx: 'update-audio', val: 1 } });
  return cpy;
};

