import { Action } from '../99.core/interface/action.interface.js'
import CpusBit from './fce/cpus.bit.js'

export const INIT_CPUS = '[Cpus action] Init Cpus'
export class InitCpus implements Action {
    readonly type = INIT_CPUS
    constructor(public bale: CpusBit) {}
}

export const VERIFY_HARDWARE_PREFLIGHT =
    '[Cpus action] Verify Hardware Preflight'
export class VerifyHardwarePreflight implements Action {
    readonly type = VERIFY_HARDWARE_PREFLIGHT
    constructor(public bale: CpusBit) {}
}

export type Actions = InitCpus | VerifyHardwarePreflight
