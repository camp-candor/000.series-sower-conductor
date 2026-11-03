import { FrameModel } from '../frame.model.js';
import FrameBit from '../fce/frame.bit.js';
import State from '../../99.core/state.js';

export const initFrame = (cpy: FrameModel, bal: FrameBit, _ste: State) => {
  if (bal.slv) bal.slv({ frameBit: { idx: 'init-frame', val: 1 } });
  return cpy;
};

export const updateFrame = (cpy: FrameModel, bal: FrameBit, _ste: State) => {
  if (bal.slv) bal.slv({ frameBit: { idx: 'update-frame', val: 1 } });
  return cpy;
};

