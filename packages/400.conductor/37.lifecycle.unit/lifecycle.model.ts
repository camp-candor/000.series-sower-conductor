import Lifecycle, {
    LifecycleStage,
    PreflightReport,
} from './fce/lifecycle.interface.js'

export class LifecycleModel implements Lifecycle {
    idx: string = '37.lifecycle.unit'
    activeSceneId: string = 'NONE'
    stage: LifecycleStage = 'IDLE'
    lastReport: PreflightReport | null = null
    lastActionTimestamp: number = 0
}
