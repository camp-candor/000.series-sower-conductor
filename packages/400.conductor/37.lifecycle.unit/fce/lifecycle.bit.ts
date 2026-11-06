import {
    MasterSceneLifecycleContext,
    MeuRepairDecision,
} from './masterLifecycle.interface.js'

export default interface LifecycleBit {
    idx: string
    src?: string
    val?: number
    dat?: {
        sceneId?: string
        episodeId?: string
        lifecycleContext?: MasterSceneLifecycleContext
        meuDecision?: MeuRepairDecision
        error?: string
    }
    slv?: Function
}
