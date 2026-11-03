import Conductor from './fce/conductor.interface.js'

export class ConductorModel implements Conductor {
    idx: string = '00.conductor.unit'
    status: string = 'OFFLINE'
    totalScenesProcessed: number = 0
}
