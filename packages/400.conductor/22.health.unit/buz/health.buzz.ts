import { HealthModel } from '../health.model.js';
import HealthBit from '../fce/health.bit.js';
import State from '../../99.core/state.js';

export const initHealth = (cpy: HealthModel, bal: HealthBit, _ste: State) => {
  if (bal.slv) bal.slv({ healthBit: { idx: 'init-health', val: 1 } });
  return cpy;
};

export const updateHealth = (cpy: HealthModel, bal: HealthBit, _ste: State) => {
  if (bal.slv) bal.slv({ healthBit: { idx: 'update-health', val: 1 } });
  return cpy;
};

