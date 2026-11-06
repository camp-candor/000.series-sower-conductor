import { LifecycleModel } from '../lifecycle.model.js'
import LifecycleBit from '../fce/lifecycle.bit.js'
import State from '../../99.core/state.js'
import { chainMasterSceneLifecycle } from './chainLifecycle.buzz.js'
import { MasterSceneLifecycleContext } from '../fce/masterLifecycle.interface.js'

export const initLifecycle = (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    ste: State,
) => {
    if (bal.slv != null) bal.slv({ lfcBit: { idx: 'init-lifecycle', val: 1 } })
    return cpy
}

export const updateLifecycle = (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    ste: State,
) => {
    if (bal.slv != null) bal.slv({ lfcBit: { idx: 'update-lifecycle' } })
    return cpy
}

export const chainMasterSceneLifecycleBuzz = async (
    cpy: LifecycleModel,
    bal: LifecycleBit,
    ste: State,
): Promise<LifecycleModel> => {
    const initialContext: MasterSceneLifecycleContext = bal.dat
        ?.lifecycleContext || {
        sceneId: bal.src || 'ep01_sc01',
        episodeId: 'ep01',
        currentStage: 'STAGE_0_IDLE',
        isDirty: false,
        shots: [
            {
                shotId: 'sh01',
                speakerId: 'char_elias',
                dialogueText: 'The pressure needle is shivering.',
                durationMs: 3125,
            },
            {
                shotId: 'sh02',
                speakerId: 'char_torvin',
                dialogueText: 'Hold the gasket.',
                durationMs: 2000,
            },
        ],
        totalFrames: 0,
        activeLeaseId: null,
        activeEpoch: null,
        stampedTsxPath: null,
        outputDeliverablePath: null,
        lockfileSha256: null,
        vramUsedMb: 0,
        t0Spend: '$0.00',
        t4Spend: '$0.00',
        attemptCount: 0,
        maxAttempts: 3,
        telemetryLogs: [],
    }

    try {
        const finalContext = await chainMasterSceneLifecycle(
            initialContext,
            ste,
        )
        cpy.lastMasterContext = finalContext
        cpy.stage = finalContext.currentStage
        cpy.lastActionTimestamp = Date.now()

        if (bal.slv != null) {
            bal.slv({
                lfcBit: {
                    idx: 'chain-master-scene-lifecycle-success',
                    val: 1,
                    src: finalContext.currentStage,
                    dat: { lifecycleContext: finalContext },
                },
            })
        }
    } catch (err: any) {
        cpy.stage = initialContext.currentStage
        cpy.lastActionTimestamp = Date.now()

        if (bal.slv != null) {
            bal.slv({
                lfcBit: {
                    idx: 'chain-master-scene-lifecycle-error',
                    val: 0,
                    src: err.message,
                    dat: { lifecycleContext: initialContext },
                },
            })
        }
    }

    return cpy
}
