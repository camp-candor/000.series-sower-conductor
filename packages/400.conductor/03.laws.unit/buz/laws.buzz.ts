import { LawsModel } from '../laws.model.js'
import LawsBit from '../fce/laws.bit.js'
import State from '../../99.core/state.js'

export const initLaws = (cpy: LawsModel, bal: LawsBit, _ste: State) => {
    if (bal.slv) bal.slv({ lawsBit: { idx: 'init-laws', val: 1 } })
    return cpy
}

export const updateLaws = (cpy: LawsModel, bal: LawsBit, _ste: State) => {
    if (bal.slv) bal.slv({ lawsBit: { idx: 'update-laws', val: 1 } })
    return cpy
}
