import EpisodeBit from './episode.bit.js'

export interface EpisodeSceneTimelineEntry {
    sceneId: string
    durationFrames: number
    startTimeHm?: string
    startTimecode: string
    endTimecode: string
}

export default interface Episode {
    idx: string
    episodeBitList: EpisodeBit[]
    episodeBits: any
    activeSeriesSlug: string
    activeDate: string
    currentClockHm: string
    cumulativeFrames: number
    sceneTimeline: EpisodeSceneTimelineEntry[]
}
