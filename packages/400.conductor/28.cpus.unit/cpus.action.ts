import { Action } from '../99.core/interface/action.interface'
import CpusBit from './fce/cpus.bit'

// Cpus actions

export const INIT_CPUS = '[Cpus action] Init Cpus'
export class InitCpus implements Action {
    readonly type = INIT_CPUS
    constructor(public bale: CpusBit) {}
}

export const UPDATE_CPUS = '[Cpus action] Update Cpus'
export class UpdateCpus implements Action {
    readonly type = UPDATE_CPUS
    constructor(public bale: CpusBit) {}
}

export type Actions = InitCpus | UpdateCpus
