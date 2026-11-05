import clone from 'clone-deep';
import * as Act from './abstractsyntaxtree.action.js';
import { AbstractSyntaxTreeModel } from './abstractsyntaxtree.model.js';
import * as Buzz from './abstractsyntaxtree.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: AbstractSyntaxTreeModel = new AbstractSyntaxTreeModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_ABSTRACTSYNTAXTREE:
      return Buzz.initAbstractsyntaxtree(clone(model), act.bale, state!);

    case Act.UPDATE_ABSTRACTSYNTAXTREE:
      return Buzz.updateAbstractsyntaxtree(clone(model), act.bale, state!);

    case Act.PARSE_SCENE_AST:
      return Buzz.parseSceneAst(clone(model), act.bale, state!);

    case Act.VERIFY_AST_PARITY:
      return Buzz.verifyAstParity(clone(model), act.bale, state!);

    default:
      return model;
  }
}
