import clone from 'clone-deep'
import * as Act from './ast.action.js'
import * as Buzz from './ast.buzzer.js'
import { AstModel } from './ast.model.js'
import State from '../99.core/state.js'

export function reducer(
    model: AstModel = new AstModel(),
    act: Act.Actions,
    state?: State,
) {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_AST:
            return Buzz.initAst(cpy, act.bale, state!)
        case Act.UPDATE_AST:
            return Buzz.updateAst(cpy, act.bale, state!)
        case Act.COMPILE_ATTENTION_SANDWICH:
            return Buzz.compileAttentionSandwichBuzz(cpy, act.bale, state!)
        case Act.COMPILE_SWAIN_MRU:
            return Buzz.compileSwainMruBuzz(cpy, act.bale, state!)
        case Act.ASSERT_VERBATIM_PARITY:
            return Buzz.assertVerbatimParityBuzz(cpy, act.bale, state!)
        default:
            return model
    }
}
