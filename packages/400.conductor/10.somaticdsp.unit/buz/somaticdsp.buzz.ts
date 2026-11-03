import { SomaticdspModel } from '../somaticdsp.model.js';
import SomaticdspBit from '../fce/somaticdsp.bit.js';
import State from '../../99.core/state.js';

export const initSomaticdsp = (cpy: SomaticdspModel, bal: SomaticdspBit, _ste: State) => {
  if (bal.slv) bal.slv({ somaticdspBit: { idx: 'init-somaticdsp', val: 1 } });
  return cpy;
};

export const updateSomaticdsp = (cpy: SomaticdspModel, bal: SomaticdspBit, _ste: State) => {
  if (bal.slv) bal.slv({ somaticdspBit: { idx: 'update-somaticdsp', val: 1 } });
  return cpy;
};

