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

export interface ExpectedAgendaBeat {
    beat_id?: string
    beatId?: string
    id?: string
    isoDate?: string
    iso_date?: string
    date?: string
    startTimeHm?: string
    start_time_hm?: string
    scheduled_time?: string
    scheduledTime?: string
}

export interface AgendaComplianceMatchedBeat {
    beat_id: string
    scene_id?: string
    isoDate?: string
    timingDeltaSeconds: number
}

export interface AgendaComplianceReport {
    compliant: boolean
    expectedCount: number
    realizedCount: number
    matchedBeats: AgendaComplianceMatchedBeat[]
    missingBeatIds: string[]
}

function parseUtcEpochSeconds(dateStr: string, hmStr: string): number | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hmStr)) return null
    const y = Number(dateStr.slice(0, 4))
    const m = Number(dateStr.slice(5, 7))
    const d = Number(dateStr.slice(8, 10))
    const hh = Number(hmStr.slice(0, 2))
    const mm = Number(hmStr.slice(3, 5))
    return Math.floor(Date.UTC(y, m - 1, d, hh, mm, 0) / 1000)
}

function extractSceneBeatId(scene: Record<string, any>): string | undefined {
    const c = (scene.chronology ?? {}) as Record<string, any>
    const a = (c.agenda ?? scene.agenda ?? {}) as Record<string, any>
    const raw =
        a.agenda_beat_id ??
        a.beatId ??
        a.beat_id ??
        c.agenda_beat_id ??
        scene.agenda_beat_id ??
        scene.agendaBeatId ??
        scene.beat_id
    return typeof raw === 'string' && raw.length > 0 ? raw : undefined
}

function extractSceneDate(scene: Record<string, any>): string | undefined {
    const c = (scene.chronology ?? {}) as Record<string, any>
    const a = (c.agenda ?? scene.agenda ?? {}) as Record<string, any>
    const scheduled: unknown =
        a.scheduled_time ?? a.scheduledTime ?? scene.scheduled_time
    let scheduledDate: string | undefined
    if (typeof scheduled === 'string' && scheduled.length >= 10) {
        const part = scheduled.slice(0, 10)
        if (/^\d{4}-\d{2}-\d{2}$/.test(part)) scheduledDate = part
    }
    const direct =
        c.start_date ?? scene.start_date ?? scene.date ?? scene.isoDate
    if (typeof direct === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(direct))
        return direct
    return scheduledDate
}

function extractSceneHm(scene: Record<string, any>): string | undefined {
    const c = (scene.chronology ?? {}) as Record<string, any>
    const a = (c.agenda ?? scene.agenda ?? {}) as Record<string, any>
    const scheduled: unknown =
        a.scheduled_time ?? a.scheduledTime ?? scene.scheduled_time
    let scheduledHm: string | undefined
    if (typeof scheduled === 'string') {
        const m = scheduled.match(/(\d{2}:\d{2})\s*$/)
        if (m && /^([01]\d|2[0-3]):[0-5]\d$/.test(m[1]!)) scheduledHm = m[1]!
    }
    const direct = c.start_time_hm ?? scene.start_time_hm ?? scene.startTimeHm
    if (typeof direct === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(direct))
        return direct
    return scheduledHm
}

function extractSceneId(scene: Record<string, any>, idx: number): string {
    const raw = scene.scene_id ?? scene.sceneId ?? scene.id
    return typeof raw === 'string' && raw.length > 0 ? raw : `scene_${idx}`
}

function normalizeExpectedBeat(beat: Record<string, any>): {
    beatId: string
    isoDate?: string
    startHm?: string
} {
    const rawId = beat.beat_id ?? beat.beatId ?? beat.id
    const beatId = typeof rawId === 'string' ? rawId : ''
    let isoDate: string | undefined
    const isoRaw = beat.isoDate ?? beat.iso_date ?? beat.date
    if (typeof isoRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoRaw))
        isoDate = isoRaw
    let startHm: string | undefined
    const hmRaw = beat.startTimeHm ?? beat.start_time_hm
    if (typeof hmRaw === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hmRaw))
        startHm = hmRaw
    const schedRaw: unknown = beat.scheduled_time ?? beat.scheduledTime
    if (typeof schedRaw === 'string') {
        const m = schedRaw.match(
            /^(\d{4}-\d{2}-\d{2})\s([01]\d|2[0-3]):[0-5]\d$/,
        )
        if (m) {
            if (!isoDate) isoDate = m[1]!
            if (!startHm) startHm = schedRaw.slice(11, 16)
        }
    }
    return { beatId, isoDate, startHm }
}

export function reconcileEpisodeAgendaCompliance(
    scenes: Array<Record<string, any>>,
    expectedBeats?: Array<Record<string, any>>,
): AgendaComplianceReport {
    const expected = Array.isArray(expectedBeats) ? expectedBeats : []
    if (expected.length === 0) {
        return {
            compliant: true,
            expectedCount: 0,
            realizedCount: 0,
            matchedBeats: [],
            missingBeatIds: [],
        }
    }
    const matchedBeats: AgendaComplianceMatchedBeat[] = []
    const missingBeatIds: string[] = []
    for (const rawBeat of expected) {
        const { beatId, isoDate, startHm } = normalizeExpectedBeat(
            (rawBeat ?? {}) as Record<string, any>,
        )
        if (!beatId) {
            continue
        }
        const candidates: Array<{
            idx: number
            scene: Record<string, any>
            sceneDate?: string
            sceneHm?: string
        }> = []
        for (let i = 0; i < scenes.length; i++) {
            const scene = (scenes[i] ?? {}) as Record<string, any>
            const sid = extractSceneBeatId(scene)
            if (sid !== beatId) continue
            const sceneDate = extractSceneDate(scene)
            const sceneHm = extractSceneHm(scene)
            if (isoDate !== undefined && sceneDate !== isoDate) continue
            candidates.push({ idx: i, scene, sceneDate, sceneHm })
        }
        if (candidates.length === 0) {
            missingBeatIds.push(beatId)
            continue
        }
        let best = candidates[0]!
        let bestDelta = 0
        let bestAbs = Number.MAX_SAFE_INTEGER
        for (const cand of candidates) {
            const beatDate = isoDate ?? cand.sceneDate
            const beatHm = startHm
            let delta = 0
            if (
                beatDate !== undefined &&
                beatHm !== undefined &&
                cand.sceneDate !== undefined &&
                cand.sceneHm !== undefined
            ) {
                const beatEpoch = parseUtcEpochSeconds(beatDate, beatHm)
                const sceneEpoch = parseUtcEpochSeconds(
                    cand.sceneDate,
                    cand.sceneHm,
                )
                if (beatEpoch !== null && sceneEpoch !== null) {
                    delta = sceneEpoch - beatEpoch
                }
            }
            const abs = Math.abs(delta)
            if (abs < bestAbs) {
                bestAbs = abs
                bestDelta = delta
                best = cand
            }
        }
        matchedBeats.push({
            beat_id: beatId,
            scene_id: extractSceneId(best.scene, best.idx),
            ...(isoDate !== undefined ? { isoDate } : {}),
            timingDeltaSeconds: Math.trunc(bestDelta),
        })
    }
    return {
        compliant: missingBeatIds.length === 0,
        expectedCount: expected.length,
        realizedCount: matchedBeats.length,
        matchedBeats,
        missingBeatIds,
    }
}
