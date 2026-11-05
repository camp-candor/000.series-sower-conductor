import clone from 'clone-deep';
import * as Act from './lifecycle.action.js';
import * as Buzz from './lifecycle.buzzer.js';
import { LifecycleModel } from './lifecycle.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: LifecycleModel = new LifecycleModel(),
  act: Act.Actions,
  state?: State
) {
  const cpy = clone(model);
  switch (act.type) {
    case Act.INIT_LIFECYCLE:
      return Buzz.initLifecycle(cpy, act.bale, state!);
    case Act.UPDATE_LIFECYCLE:
      return Buzz.updateLifecycle(cpy, act.bale, state!);
    case Act.RUN_INCEPTION_PREFLIGHT:
      return Buzz.runInceptionPreflight(cpy, act.bale, state!);
    case Act.QUANTIZE_ACOUSTIC_CLOCK:
      return Buzz.quantizeAcousticClockBuzz(cpy, act.bale, state!);
    case Act.CONFORM_DIFFUSION_LATTICE:
      return Buzz.conformDiffusionLatticeBuzz(cpy, act.bale, state!);
    case Act.SEAL_PROVENANCE_LEDGER:
      return Buzz.sealProvenanceLedgerBuzz(cpy, act.bale, state!);
    case Act.CHAIN_MASTER_SCENE_LIFECYCLE:
      return Buzz.chainMasterSceneLifecycleBuzz(cpy, act.bale, state!);
    default:
      return model;
  }
}
