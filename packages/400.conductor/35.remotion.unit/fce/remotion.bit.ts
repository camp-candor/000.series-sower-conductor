import {
    SceneShotPlan,
    StampCompositionOptions,
    StampCompositionReceipt,
} from './remotion.interface.js'

export default interface RemotionBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        sceneId?: string
        shots?: SceneShotPlan[]
        options?: StampCompositionOptions
        receipt?: StampCompositionReceipt
        [key: string]: any
    }
    slv?: Function
}
