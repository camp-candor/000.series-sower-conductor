import { RemotionModel } from '../remotion.model.js'
import RemotionBit from '../fce/remotion.bit.js'
import State from '../../99.core/state.js'
import { stampStaticComposition } from './stampComposition.buzz.js'
import { SceneShotPlan } from '../fce/remotion.interface.js'
import { SwangleRenderOptions } from '../fce/renderOptions.interface.js'
import { spawnSwangleRenderProcess } from './renderSwangle.buzz.js'

export const initRemotion = async (
    cpy: RemotionModel,
    bal: RemotionBit,
    _ste: State,
) => {
    cpy.status = 'INITIALIZED'
    cpy.lastActionTimestamp = Date.now()
    if (bal.slv) bal.slv({ remotionBit: { idx: 'init-remotion', val: 1 } })
    return cpy
}

export const updateRemotion = async (
    cpy: RemotionModel,
    bal: RemotionBit,
    _ste: State,
) => {
    cpy.lastActionTimestamp = Date.now()
    if (bal.slv) bal.slv({ remotionBit: { idx: 'update-remotion', val: 1 } })
    return cpy
}

export const stampStaticCompositionBuzz = async (
    cpy: RemotionModel,
    bal: RemotionBit,
    _ste: State,
) => {
    const sceneId = bal.dat?.sceneId || bal.src || 'ep01_sc01'
    const shots = (bal.dat?.shots || []) as SceneShotPlan[]
    const options = bal.dat?.options || {}

    const receipt = await stampStaticComposition(sceneId, shots, options)

    cpy.lastStampedSceneId = sceneId
    cpy.lastStampedFilePath = receipt.destinationPath
    cpy.lastChecksumSha256 = receipt.checksumSha256
    cpy.status = receipt.wasClobberRefused
        ? 'CANDIDATE_STAMPED'
        : 'COMPOSITION_STAMPED'
    cpy.lastActionTimestamp = Date.now()

    if (bal.slv) {
        bal.slv({
            remotionBit: {
                idx: 'stamp-static-composition',
                val: receipt.ok ? 1 : 0,
                src: receipt.destinationPath,
                dat: { receipt },
            },
        })
    }

    return cpy
}

export const renderSwangleBuzz = async (
    cpy: import('../remotion.model.js').RemotionModel,
    bal: import('../fce/remotion.bit.js').default,
    _ste: import('../../99.core/state.js').default,
) => {
    const renderOptions = bal.dat?.renderOptions as SwangleRenderOptions
    if (!renderOptions) {
        if (bal.slv)
            bal.slv({
                remotionBit: {
                    idx: 'render-swangle',
                    val: 0,
                    src: 'MISSING_RENDER_OPTIONS',
                },
            })
        return cpy
    }

    try {
        const receipt = await spawnSwangleRenderProcess(renderOptions)
        cpy.lastRenderReceipt = receipt
        cpy.status = receipt.ok ? 'RENDER_SUCCESS' : 'RENDER_FAILED'
        cpy.lastActionTimestamp = Date.now()

        if (bal.slv) {
            bal.slv({
                remotionBit: {
                    idx: 'render-swangle',
                    val: receipt.ok ? 1 : 0,
                    src: receipt.ok
                        ? 'RENDER_COMPLETE'
                        : receipt.error || 'RENDER_FAILED',
                    dat: { receipt },
                },
            })
        }
    } catch (err: any) {
        const fallbackReceipt: import('../fce/renderOptions.interface.js').SwangleRenderReceipt =
            {
                ok: false,
                outputLocation: renderOptions.outputLocation,
                totalFrames: renderOptions.expectedFrames ?? 0,
                renderedFrames: 0,
                durationMs: 0,
                vramUsedMb: 0,
                t4Spend: '$0.00',
                cliCommand: 'npx remotion render',
                exitCode: 1,
                error: `SPAWN_ERROR: ${err.message}`,
            }
        cpy.lastRenderReceipt = fallbackReceipt
        cpy.status = 'RENDER_FAILED'
        cpy.lastActionTimestamp = Date.now()

        if (bal.slv) {
            bal.slv({
                remotionBit: {
                    idx: 'render-swangle',
                    val: 0,
                    src: fallbackReceipt.error,
                    dat: { receipt: fallbackReceipt },
                },
            })
        }
    }

    return cpy
}
