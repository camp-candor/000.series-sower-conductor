import Continuity from './fce/continuity.interface.js'

export class ContinuityModel implements Continuity {
    idx: string = '29.continuity.unit'
    lastEvaluatedSceneId: string = 'NONE'
    totalScenesChecked: number = 0
    totalDirtyScenesBlocked: number = 0
    lastEvaluationDurationMs: number = 0
}
