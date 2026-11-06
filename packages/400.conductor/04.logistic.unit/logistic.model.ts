import Logistic, { DispatchReceipt } from './fce/logistic.interface.js'

export class LogisticModel implements Logistic {
    idx: string = '04.logistic.unit'
    edgeCoordinatorUrl: string = 'http://127.0.0.1:8787'
    currentLeaseEpoch: number = 0
    totalDispatchesExecuted: number = 0
    activeDispatches: Record<string, DispatchReceipt> = {}
}
