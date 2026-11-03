import { NarrativeModel } from '../narrative.model.js';
import NarrativeBit from '../fce/narrative.bit.js';
import State from '../../99.core/state.js';

export const initNarrative = (cpy: NarrativeModel, bal: NarrativeBit, _ste: State) => {
  if (bal.slv) bal.slv({ narrativeBit: { idx: 'init-narrative', val: 1 } });
  return cpy;
};

export const updateNarrative = (cpy: NarrativeModel, bal: NarrativeBit, _ste: State) => {
  if (bal.slv) bal.slv({ narrativeBit: { idx: 'update-narrative', val: 1 } });
  return cpy;
};

