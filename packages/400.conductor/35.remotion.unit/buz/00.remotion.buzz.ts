import { RemotionModel } from '../remotion.model.js'
import RemotionBit from '../fce/remotion.bit.js'
import State from '../../99.core/state.js'
import { stampStaticComposition } from './stampComposition.buzz.js'
import { SceneShotPlan } from '../fce/remotion.interface.js'

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
