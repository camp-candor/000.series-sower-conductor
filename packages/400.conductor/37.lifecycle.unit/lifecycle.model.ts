import Lifecycle, {
    LifecycleStage,
    PreflightReport,
} from './fce/lifecycle.interface.js'
import {
    UniversalProvenanceManifest,
    SettlementDispatchReceipt,
} from './fce/provenance.interface.js'

export class LifecycleModel implements Lifecycle {
    idx: string = '37.lifecycle.unit'
    activeSceneId: string = 'NONE'
    stage: LifecycleStage = 'IDLE'
    lastReport: PreflightReport | null = null
    lastProvenanceManifest: UniversalProvenanceManifest | null = null
    lastSettlementReceipt: SettlementDispatchReceipt | null = null
    lastActionTimestamp: number = 0
}
