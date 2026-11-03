import Cpus from './fce/cpus.interface.js'

export class CpusModel implements Cpus {
    idx: string = '28.cpus.unit'
    cores: number = 0
    totalMemoryBytes: number = 0
    ffprobeVersion: string = 'UNKNOWN'
    gitVersion: string = 'UNKNOWN'
    verified: boolean = false
}
