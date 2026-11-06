import { LocationModel } from '../location.model.js'
import LocationBit from '../fce/location.bit.js'
import State from '../../99.core/state.js'

export const initLocation = (
    cpy: LocationModel,
    bal: LocationBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ locationBit: { idx: 'init-location', val: 1 } })
    return cpy
}

export const updateLocation = (
    cpy: LocationModel,
    bal: LocationBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ locationBit: { idx: 'update-location', val: 1 } })
    return cpy
}
