import { MemoryModel } from '../memory.model.js';
import MemoryBit from '../fce/memory.bit.js';
import State from '../../99.core/state.js';

export const initMemory = (cpy: MemoryModel, bal: MemoryBit, _ste: State) => {
  if (bal.slv) bal.slv({ memoryBit: { idx: 'init-memory', val: 1 } });
  return cpy;
};

export const updateMemory = (cpy: MemoryModel, bal: MemoryBit, _ste: State) => {
  if (bal.slv) bal.slv({ memoryBit: { idx: 'update-memory', val: 1 } });
  return cpy;
};

