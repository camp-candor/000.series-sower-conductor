import Ledger from './fce/ledger.interface.js'

export class LedgerModel implements Ledger {
    idx: string = '21.ledger.unit'
    lastEventId: string = 'NONE'
    totalEventsLogged: number = 0
    unsealedDeltasCount: number = 0
}
