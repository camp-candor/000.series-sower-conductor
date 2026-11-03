import { PropsModel } from '../props.model.js';
import PropsBit from '../fce/props.bit.js';
import State from '../../99.core/state.js';

export const initProps = (cpy: PropsModel, bal: PropsBit, _ste: State) => {
  if (bal.slv) bal.slv({ propsBit: { idx: 'init-props', val: 1 } });
  return cpy;
};

export const updateProps = (cpy: PropsModel, bal: PropsBit, _ste: State) => {
  if (bal.slv) bal.slv({ propsBit: { idx: 'update-props', val: 1 } });
  return cpy;
};

