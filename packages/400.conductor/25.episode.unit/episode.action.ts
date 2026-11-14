import { Action } from '../99.core/interface/action.interface.js'
import EpisodeBit from './fce/episode.bit.js'

// Episode actions

export const INIT_EPISODE = '[Episode action] Init Episode'
export class InitEpisode implements Action {
    readonly type = INIT_EPISODE
    constructor(public bale: EpisodeBit) {}
}

export const UPDATE_EPISODE = '[Episode action] Update Episode'
export class UpdateEpisode implements Action {
    readonly type = UPDATE_EPISODE
    constructor(public bale: EpisodeBit) {}
}

export const ANCHOR_EPISODE_CHRONOLOGY =
    '[Episode action] Anchor Episode Chronology'
export class AnchorEpisodeChronology implements Action {
    readonly type = ANCHOR_EPISODE_CHRONOLOGY
    constructor(public bale: EpisodeBit) {}
}

export const ADVANCE_EPISODE_SCENE = '[Episode action] Advance Episode Scene'
export class AdvanceEpisodeScene implements Action {
    readonly type = ADVANCE_EPISODE_SCENE
    constructor(public bale: EpisodeBit) {}
}

export type Actions =
    InitEpisode | UpdateEpisode | AnchorEpisodeChronology | AdvanceEpisodeScene
