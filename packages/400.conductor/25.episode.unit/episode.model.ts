import Episode from './fce/episode.interface.js'
import EpisodeBit from './fce/episode.bit.js'

export class EpisodeModel implements Episode {
    idx: string = '25.episode'
    episodeBitList: EpisodeBit[] = []
    episodeBits: any = {}
    activeSeriesSlug: string = ''
    activeDate: string = ''
    currentClockHm: string = '00:00'
    cumulativeFrames: number = 0
    sceneTimeline: Episode['sceneTimeline'] = []
}
