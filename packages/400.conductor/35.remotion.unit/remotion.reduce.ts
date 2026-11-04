import clone from 'clone-deep';
import * as Act from './remotion.action.js';
import * as Buzz from './remotion.buzzer.js';
import { RemotionModel } from './remotion.model.js';
import State from '../99.core/state.js';

export function reducer(
  model: RemotionModel = new RemotionModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_REMOTION:
      return Buzz.initRemotion(clone(model), act.bale, state!);
    case Act.CHECK_EJECT_LOCK:
      return Buzz.checkEjectLock(clone(model), act.bale, state!);
    case Act.STAMP_STATIC_COMPOSITION:
      return Buzz.stampStaticComposition(clone(model), act.bale, state!);
    case Act.MUTATE_MEU_AST:
      return Buzz.mutateMeuAst(clone(model), act.bale, state!);
    case Act.EMIT_PROVENANCE_LOCKFILE:
      return Buzz.emitProvenanceLockfile(clone(model), act.bale, state!);
    default:
      return model;
  }
}
