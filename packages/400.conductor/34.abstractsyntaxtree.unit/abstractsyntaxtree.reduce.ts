import clone from 'clone-deep'
import * as Act from './abstractsyntaxtree.action.js'
import * as Buzz from './abstractsyntaxtree.buzzer.js'
import { AbstractSyntaxTreeModel } from './abstractsyntaxtree.model.js'
import State from '../99.core/state.js'

export const reducer = (
    model: any = new AbstractSyntaxTreeModel(),
    act: Act.Actions,
    state: State,
) => {
    const cpy = clone(model)
    switch (act.type) {
        case Act.INIT_ABSTRACTSYNTAXTREE:
            return Buzz.initAbstractSyntaxTree(cpy, act.bale, state)
        case Act.PARSE_SCENE_AST:
            return Buzz.parseSceneAST(cpy, act.bale, state)
        default:
            return cpy
    }
}
