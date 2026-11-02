import { Action } from '../99.core/interface/action.interface'
import HealthBit from './fce/health.bit'

// Health actions

export const INIT_HEALTH = '[Health action] Init Health'
export class InitHealth implements Action {
    readonly type = INIT_HEALTH
    constructor(public bale: HealthBit) {}
}

export const UPDATE_HEALTH = '[Health action] Update Health'
export class UpdateHealth implements Action {
    readonly type = UPDATE_HEALTH
    constructor(public bale: HealthBit) {}
}

export type Actions = InitHealth | UpdateHealth
