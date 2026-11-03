import { TelemetryModel } from '../telemetry.model.js';
import TelemetryBit from '../fce/telemetry.bit.js';
import State from '../../99.core/state.js';

export const initTelemetry = (cpy: TelemetryModel, bal: TelemetryBit, _ste: State) => {
  if (bal.slv) bal.slv({ telemetryBit: { idx: 'init-telemetry', val: 1 } });
  return cpy;
};

export const updateTelemetry = (cpy: TelemetryModel, bal: TelemetryBit, _ste: State) => {
  if (bal.slv) bal.slv({ telemetryBit: { idx: 'update-telemetry', val: 1 } });
  return cpy;
};

