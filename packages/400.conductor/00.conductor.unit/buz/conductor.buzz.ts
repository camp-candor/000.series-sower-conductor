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
    cpy.status = 'READY';
    process.stdout.write('>> [CONDUCTOR] [OK] packages/400.conductor initialized cleanly.\n');

    const urlconductor = 'https://zero00-conductor.onrender.com/api/conductor/test';

    Promise.resolve().then(async () => {
        try {
            const res = await fetch(urlconductor);
            const data = await res.json();
            if (bal.slv) {
                bal.slv({
                    intBit: {
                        idx: 'init-conductor',
                        dat: {
                            conductor: data,
                        },
                    },
                });
            }
        } catch (e: any) {
            if (bal.slv) {
                bal.slv({
                    intBit: {
                        idx: 'init-conductor-err',
                        dat: e.message,
                    },
                });
            }
        }
    });

    if (bal.slv) {
        bal.slv({
            conductorBit: {
                idx: 'init-conductor',
                val: 1,
                dat: { status: cpy.status }
            }
        });
    }
    return cpy;
};

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
