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
        audioOnly?: boolean
        outputTsxPath?: string
        kinematicsModes?: any
        audioPlan?: any
        [key: string]: any
    }
    slv?: Function
}
