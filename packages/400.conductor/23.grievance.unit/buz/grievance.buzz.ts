import { GrievanceModel } from '../grievance.model.js';
import GrievanceBit from '../fce/grievance.bit.js';
import State from '../../99.core/state.js';

export const initGrievance = (cpy: GrievanceModel, bal: GrievanceBit, _ste: State) => {
  if (bal.slv) bal.slv({ grievanceBit: { idx: 'init-grievance', val: 1 } });
  return cpy;
};

export const updateGrievance = (cpy: GrievanceModel, bal: GrievanceBit, _ste: State) => {
  if (bal.slv) bal.slv({ grievanceBit: { idx: 'update-grievance', val: 1 } });
  return cpy;
};

