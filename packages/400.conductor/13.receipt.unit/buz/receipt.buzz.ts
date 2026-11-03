import { ReceiptModel } from '../receipt.model.js';
import ReceiptBit from '../fce/receipt.bit.js';
import State from '../../99.core/state.js';

export const initReceipt = (cpy: ReceiptModel, bal: ReceiptBit, _ste: State) => {
  if (bal.slv) bal.slv({ receiptBit: { idx: 'init-receipt', val: 1 } });
  return cpy;
};

export const updateReceipt = (cpy: ReceiptModel, bal: ReceiptBit, _ste: State) => {
  if (bal.slv) bal.slv({ receiptBit: { idx: 'update-receipt', val: 1 } });
  return cpy;
};

