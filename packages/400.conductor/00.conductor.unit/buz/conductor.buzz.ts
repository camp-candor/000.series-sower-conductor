import { ConductorModel } from '../conductor.model.js'
import ConductorBit from '../fce/conductor.bit.js'
import State from '../../99.core/state.js'

const conductor = {
    list: async () => {
        return { models: [] as any[] }
    },
}

export const initConductor = (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    const url =
        process.env.CONDUCTOR_URL ||
        'https://zero00-conductor.onrender.com/api/conductor/test'
    if (url) {
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-conductor',
                            dat: {
                                conductor: data,
                            },
                        },
                    })
                }
            })
            .catch((error: any) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-conductor-err',
                            dat: error.message,
                        },
                    })
                }
            })
    } else {
        if (bal.slv != null) {
            bal.slv({ intBit: { idx: 'init-conductor' } })
        }
    }
    return cpy
}

export const updateConductor = (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    bal.slv({ intBit: { idx: 'update-conductor' } })

    return cpy
}

export const testConductor = (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    bal.slv({ mytBit: { idx: 'test-conductor', val: 1 } })
    return cpy
}

export const listConductor = async (
    cpy: ConductorModel,
    bal: ConductorBit,
    ste: State,
) => {
    const response = await conductor.list()
    if (bal.slv != null)
        bal.slv({
            olmBit: {
                idx: 'list-conductor',
                lst: response.models.map((m: any) => m.name),
            },
        })
    return cpy
}
