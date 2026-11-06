import { ReactionModel } from '../reaction.model.js'
import ReactionBit from '../fce/reaction.bit.js'
import State from '../../99.core/state.js'

export const initReaction = (
    cpy: ReactionModel,
    bal: ReactionBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ reactionBit: { idx: 'init-reaction', val: 1 } })
    return cpy
}

export const updateReaction = (
    cpy: ReactionModel,
    bal: ReactionBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ reactionBit: { idx: 'update-reaction', val: 1 } })
    return cpy
}
