import { Action } from '../99.core/interface/action.interface'
import AbstractsyntaxtreeBit from './fce/abstractsyntaxtree.bit'

// Abstractsyntaxtree actions

export const INIT_ABSTRACTSYNTAXTREE =
    '[Abstractsyntaxtree action] Init Abstractsyntaxtree'
export class InitAbstractsyntaxtree implements Action {
    readonly type = INIT_ABSTRACTSYNTAXTREE
    constructor(public bale: AbstractsyntaxtreeBit) {}
}

export const UPDATE_ABSTRACTSYNTAXTREE =
    '[Abstractsyntaxtree action] Update Abstractsyntaxtree'
export class UpdateAbstractsyntaxtree implements Action {
    readonly type = UPDATE_ABSTRACTSYNTAXTREE
    constructor(public bale: AbstractsyntaxtreeBit) {}
}

export type Actions = InitAbstractsyntaxtree | UpdateAbstractsyntaxtree
