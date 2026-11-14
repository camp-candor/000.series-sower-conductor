import { EpisodeModel } from '../episode.model.js'
import EpisodeBit from '../fce/episode.bit.js'
import State from '../../99.core/state.js'
import { frameToSmpteTimecode24 } from '../../24.frame.unit/buz/frame.buzz.js'

export const initEpisode = (cpy: EpisodeModel, bal: EpisodeBit, ste: State) => {
    if (bal.slv != null) bal.slv({ epsBit: { idx: 'init-episode', val: 1 } })
    return cpy
}

export const updateEpisode = (
    cpy: EpisodeModel,
    bal: EpisodeBit,
    ste: State,
) => {
    if (bal.slv != null) bal.slv({ epsBit: { idx: 'update-episode' } })
    return cpy
}

export const anchorEpisodeChronology = (
    cpy: EpisodeModel,
    bal: EpisodeBit,
    ste: State,
) => {
    const dat = (bal.dat ?? {}) as Record<string, any>
    cpy.activeSeriesSlug = String(
        dat.seriesSlug ?? dat.series_slug ?? cpy.activeSeriesSlug,
    )
    const startDate = String(
        dat.startDate ?? dat.start_date ?? cpy.activeDate ?? '',
    ).trim()
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        throw new Error(
            `CHRONOLOGY_INVALID_DATE: startDate [${startDate}] must match YYYY-MM-DD`,
        )
    }
    const startTimeHm = String(
        dat.startTimeHm ?? dat.start_time_hm ?? '00:00',
    ).trim()
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTimeHm)) {
        throw new Error(
            `INVALID_START_CLOCK: startTimeHm [${startTimeHm}] must match HH:MM`,
        )
    }
    cpy.activeDate = startDate
    cpy.currentClockHm = startTimeHm
    cpy.sceneTimeline = []
    cpy.cumulativeFrames = 0
    if (global.LIBRARY) {
        void global.LIBRARY.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: `>> [EPISODE:CHRONO] Anchored [${cpy.activeSeriesSlug}] ${cpy.activeDate} ${cpy.currentClockHm}`,
        }).catch(() => {})
    }
    if (bal.slv != null) {
        bal.slv({
            epsBit: {
                idx: 'anchor-episode-chronology-success',
                dat: {
                    seriesSlug: cpy.activeSeriesSlug,
                    startDate: cpy.activeDate,
                    startTimeHm: cpy.currentClockHm,
                },
            },
        })
    }
    return cpy
}

export const advanceEpisodeScene = (
    cpy: EpisodeModel,
    bal: EpisodeBit,
    ste: State,
) => {
    const dat = (bal.dat ?? {}) as Record<string, any>
    const sceneId = String(dat.sceneId ?? dat.scene_id ?? 'ep01_sc01')
    const durationFrames = Number(
        dat.durationFrames ?? dat.duration_frames ?? 24,
    )
    if (!Number.isInteger(durationFrames) || durationFrames <= 0) {
        throw new Error(
            'INVALID_DURATION_FRAMES: durationFrames must be positive int',
        )
    }
    const startTimeHm = String(dat.startTimeHm ?? cpy.currentClockHm ?? '00:00')
    const startTimecode = frameToSmpteTimecode24(
        cpy.cumulativeFrames,
        cpy.currentClockHm,
    )
    const endTimecode = frameToSmpteTimecode24(
        cpy.cumulativeFrames + durationFrames - 1,
        cpy.currentClockHm,
    )
    cpy.sceneTimeline.push({
        sceneId,
        durationFrames,
        startTimeHm,
        startTimecode,
        endTimecode,
    })
    cpy.cumulativeFrames += durationFrames
    if (global.LIBRARY) {
        void global.LIBRARY.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: `>> [FRAME:SMPTE] Scene [${sceneId}] ${startTimecode} -> ${endTimecode} | Frames ${durationFrames} @ 24fps`,
        }).catch(() => {})
    }
    if (bal.slv != null) {
        bal.slv({
            epsBit: {
                idx: 'advance-episode-scene-success',
                dat: {
                    sceneId,
                    startTimecode,
                    endTimecode,
                    cumulativeFrames: cpy.cumulativeFrames,
                },
            },
        })
    }
    return cpy
}
