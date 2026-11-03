import { Model } from '../../99.core/interface/model.interface.js'

export interface ContinuityEvaluationResult {
    allowed: boolean
    is_dirty: boolean
    reason?: string
    duration_ms: number
}

export default interface Continuity extends Model {
    lastEvaluatedSceneId: string
    totalScenesChecked: number
    totalDirtyScenesBlocked: number
    lastEvaluationDurationMs: number
}
