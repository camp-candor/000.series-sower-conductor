import { ExtractedDialogueTurn } from '../fce/parity.interface.js'

const CUE_EXTENSION_REGEX =
    /\s*\((?:CONT'D|CONT\u2019D|O\.S\.|V\.O\.|OFF)\)\s*$/i
const TITLE_HEADER_REGEX =
    /^(Title|Credit|Author|Draft date|Contact|Series|Scene|Date|Start-Time|End-Time|Timecode|Daypart|Timezone|Era|Act|Agenda-Beat-Id|Scheduled-Time|Reserve-Held-Ticks):/i

export interface FountainAgendaHeaders {
    beatId: string
    scheduledTime: string
    reserveHeldTicks: number
}

export interface FountainChronologyHeaders {
    date?: string
    startTimeHm?: string
    startTimeHms?: string
    timecodeSmpte?: string
    daypart?: string
    timezoneLabel?: string
    eraLabel?: string
    series?: string
    scene?: string
    agendaBeatId?: string
    scheduledTime?: string
    reserveHeldTicks?: number
    agenda?: FountainAgendaHeaders
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const HM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
const HMS_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
const AGENDA_BEAT_ID_REGEX = /^[a-z0-9_]+$/
const AGENDA_SCHEDULED_TIME_REGEX =
    /^\d{4}-\d{2}-\d{2}\s([01]\d|2[0-3]):[0-5]\d$/

function isValidIsoCalendarDate(isoDate: string): boolean {
    if (!DATE_REGEX.test(isoDate)) return false
    const [y, m, d] = isoDate.split('-').map((n) => Number(n))
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return false
    const dt = new Date(Date.UTC(y, m - 1, d))
    return (
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() === m - 1 &&
        dt.getUTCDate() === d
    )
}

export function parseFountainChronology(
    fountainText: string,
): FountainChronologyHeaders {
    const result: FountainChronologyHeaders = {}
    if (!fountainText || fountainText.trim().length === 0) {
        return result
    }
    const lines = fountainText.replace(/\r\n/g, '\n').split('\n')
    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (line.length === 0) continue
        const match = line.match(/^([A-Za-z\- ]+):\s*(.*)$/)
        if (!match) continue
        const key = match[1]!.trim().toLowerCase()
        const value = match[2]!.trim()
        switch (key) {
            case 'date':
                if (!isValidIsoCalendarDate(value)) {
                    throw new Error(
                        `CHRONOLOGY_INVALID_DATE: Date [${value}] must match valid YYYY-MM-DD`,
                    )
                }
                result.date = value
                break
            case 'start-time':
                if (HMS_REGEX.test(value)) {
                    result.startTimeHms = value
                    result.startTimeHm = value.slice(0, 5)
                } else if (HM_REGEX.test(value)) {
                    result.startTimeHm = value
                } else {
                    throw new Error(
                        `CHRONOLOGY_INVALID_START_TIME: Start-Time [${value}] must match HH:MM or HH:MM:SS`,
                    )
                }
                break
            case 'timecode':
                result.timecodeSmpte = value
                break
            case 'daypart':
                result.daypart = value
                break
            case 'timezone':
                result.timezoneLabel = value
                break
            case 'era':
                result.eraLabel = value
                break
            case 'series':
                result.series = value
                break
            case 'scene':
                result.scene = value
                break
            case 'agenda-beat-id':
                if (!AGENDA_BEAT_ID_REGEX.test(value)) {
                    throw new Error(
                        `INVALID_FOUNTAIN_AGENDA_BEAT_ID: Agenda-Beat-Id [${value}] must match /^[a-z0-9_]+$/`,
                    )
                }
                result.agendaBeatId = value
                break
            case 'scheduled-time':
                if (
                    !AGENDA_SCHEDULED_TIME_REGEX.test(value) ||
                    !isValidIsoCalendarDate(value.slice(0, 10))
                ) {
                    throw new Error(
                        `INVALID_FOUNTAIN_AGENDA_TIMESTAMP: Scheduled-Time [${value}] must match valid YYYY-MM-DD HH:MM`,
                    )
                }
                result.scheduledTime = value
                break
            case 'reserve-held-ticks': {
                const parsed = Number(value)
                if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1000) {
                    throw new Error(
                        `INVALID_FOUNTAIN_AGENDA_RESERVE_TICKS: Reserve-Held-Ticks [${value}] must be integer 0..1000`,
                    )
                }
                result.reserveHeldTicks = parsed
                break
            }
            default:
                break
        }
    }
    if (
        result.agendaBeatId !== undefined ||
        result.scheduledTime !== undefined ||
        result.reserveHeldTicks !== undefined
    ) {
        if (
            result.agendaBeatId === undefined ||
            result.scheduledTime === undefined
        ) {
            throw new Error(
                'INVALID_FOUNTAIN_AGENDA_TIMESTAMP: Agenda-Beat-Id and Scheduled-Time must both be present when agenda headers exist',
            )
        }
        result.agenda = {
            beatId: result.agendaBeatId,
            scheduledTime: result.scheduledTime,
            reserveHeldTicks: result.reserveHeldTicks ?? 0,
        }
    }
    return result
}

export function normalizePunctuation(text: string): string {
    if (!text) return ''

    return (
        text
            // Replace smart typographical quotes
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            // Replace typographical dashes and ellipses
            .replace(/\u2014/g, '--')
            .replace(/\u2026/g, '...')
            // Normalize whitespace runs and trim
            .replace(/\r\n/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .trim()
    )
}

export function normalizeSpeakerCue(rawLine: string): string {
    return rawLine
        .replace(/\u2019/g, "'")
        .replace(/\s*\^$/, '')
        .replace(CUE_EXTENSION_REGEX, '')
        .trim()
}

export function isFountainCharacterCue(line: string): boolean {
    if (!line || line === '===') return false
    if (TITLE_HEADER_REGEX.test(line)) return false
    if (/^(INT\.|EXT\.|INT\/EXT\.|EST\.)/i.test(line)) return false
    if (
        /^[A-Z\s]+ TO:$/.test(line) ||
        line === 'FADE OUT.' ||
        line === 'CUT TO:'
    ) {
        return false
    }
    const stripped = normalizeSpeakerCue(line)
    return (
        stripped.length > 0 &&
        stripped.length <= 40 &&
        /^[A-Z0-9\s_.'-]+$/.test(stripped) &&
        /[A-Z]/.test(stripped)
    )
}

export function parseFountainDialogue(
    fountainText: string,
): ExtractedDialogueTurn[] {
    if (!fountainText || fountainText.trim().length === 0) {
        return []
    }

    const lines = fountainText.replace(/\r\n/g, '\n').split('\n')
    const turns: ExtractedDialogueTurn[] = []

    let currentSpeaker: string | null = null
    let accumulatedDialogue: string[] = []
    let inTitlePage = true
    let inBlockComment = false

    const flushTurn = () => {
        if (currentSpeaker && accumulatedDialogue.length > 0) {
            const fullText = accumulatedDialogue.join(' ').trim()
            if (fullText.length > 0) {
                turns.push({
                    speaker: currentSpeaker,
                    dialogueText: fullText,
                    lineNumber: turns.length + 1,
                })
            }
        }
        currentSpeaker = null
        accumulatedDialogue = []
    }

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i]
        const line = rawLine.trim()

        if (inBlockComment) {
            if (line.includes('*/')) {
                inBlockComment = false
            }
            continue
        }
        if (line.startsWith('/*')) {
            if (!line.includes('*/')) {
                inBlockComment = true
            }
            continue
        }

        // Handle title page logic: stay in title page across ALL
        // contiguous TITLE_HEADER_REGEX lines (no line-count cap) until a
        // blank line or a non-header token is reached.
        if (inTitlePage) {
            if (line === '===') {
                inTitlePage = false
                continue
            }
            if (TITLE_HEADER_REGEX.test(line) || line.length === 0) {
                continue
            }
            inTitlePage = false
        }

        // If still in title page explicitly, skip
        if (
            inTitlePage &&
            (TITLE_HEADER_REGEX.test(line) || line.startsWith(' '))
        ) {
            continue
        } else {
            inTitlePage = false
        }

        // Empty line terminates dialogue block
        if (line.length === 0) {
            flushTurn()
            continue
        }

        // Ignore Scene Headings
        if (/^(INT\.|EXT\.|INT\/EXT\.|EST\.)/i.test(line)) {
            flushTurn()
            continue
        }

        // Ignore Transitions
        if (
            /^[A-Z\s]+ TO:$/.test(line) ||
            line === 'FADE OUT.' ||
            line === 'CUT TO:'
        ) {
            flushTurn()
            continue
        }

        // Parentheticals: Skip from spoken dialogue
        if (line.startsWith('(') && line.endsWith(')')) {
            continue
        }

        if (isFountainCharacterCue(line) && !currentSpeaker) {
            currentSpeaker = normalizeSpeakerCue(line)
            continue
        }

        // If currently parsing dialogue under a character cue
        if (currentSpeaker) {
            accumulatedDialogue.push(line)
        }
    }

    flushTurn()
    return turns
}

export function isFountainTransitionLine(line: string): boolean {
    if (!line) return false
    const t = line.trim()
    if (t.length === 0) return false
    if (t.startsWith('>')) return true
    if (/^[A-Z0-9\s]+ TO:$/.test(t)) return true
    if (t === 'FADE OUT.' || t === 'FADE IN:') return true
    if (/^TIME CUT:/i.test(t)) return true
    return false
}

export function isFountainParenthetical(line: string): boolean {
    if (!line) return false
    const t = line.trim()
    return /^\([^)]+\)$/.test(t)
}

export interface FountainCategoryDetail {
    count: number
    example: string | null
}

export interface FountainSixCategoryReport {
    sluglines: FountainCategoryDetail
    actionLines: FountainCategoryDetail
    characterCues: FountainCategoryDetail
    parentheticals: FountainCategoryDetail
    dialogueLines: FountainCategoryDetail
    transitions: FountainCategoryDetail
    dateHeader: string | null
    startTimeHm: string | null
    chronology: FountainChronologyHeaders
    allValid: boolean
}

export interface StackedScreenplayEntry {
    sequence: number
    tick: number
    fileName: string
}

export function parseStackedScreenplayFileName(
    fileName: string,
): StackedScreenplayEntry {
    const seqMatch = fileName.match(/(\d+)/)
    const sequence = seqMatch ? parseInt(seqMatch[1]!, 10) : 999999
    const tickMatch = fileName.match(/tick[_-]?(\d+)/i)
    const tick = tickMatch ? parseInt(tickMatch[1]!, 10) : 0
    return { sequence, tick, fileName }
}

export function sortStackedScreenplayFiles(names: string[]): string[] {
    const filtered = names.filter((n) => n.endsWith('.fountain'))
    const entries = filtered.map((n) => parseStackedScreenplayFileName(n))
    entries.sort((a, b) => {
        if (a.sequence !== b.sequence) return a.sequence - b.sequence
        if (a.tick !== b.tick) return a.tick - b.tick
        if (a.fileName < b.fileName) return -1
        if (a.fileName > b.fileName) return 1
        return 0
    })
    return entries.map((e) => e.fileName)
}

export function discoverAutoScriptStack(
    dirEntries: string[],
): StackedScreenplayEntry[] {
    return sortStackedScreenplayFiles(dirEntries).map((fileName) =>
        parseStackedScreenplayFileName(fileName),
    )
}

export function auditFountainSixCategories(
    fountainText: string,
): FountainSixCategoryReport {
    const emptyDetail = (): FountainCategoryDetail => ({
        count: 0,
        example: null,
    })
    const report: FountainSixCategoryReport = {
        sluglines: emptyDetail(),
        actionLines: emptyDetail(),
        characterCues: emptyDetail(),
        parentheticals: emptyDetail(),
        dialogueLines: emptyDetail(),
        transitions: emptyDetail(),
        dateHeader: null,
        startTimeHm: null,
        chronology: {},
        allValid: false,
    }
    if (!fountainText || fountainText.trim().length === 0) {
        return report
    }
    let chronology: FountainChronologyHeaders = {}
    try {
        chronology = parseFountainChronology(fountainText)
    } catch {
        chronology = {}
    }
    report.chronology = chronology
    if (chronology.date) report.dateHeader = chronology.date
    if (chronology.startTimeHm) report.startTimeHm = chronology.startTimeHm

    const lines = fountainText.replace(/\r\n/g, '\n').split('\n')
    let inBlockComment = false
    let currentSpeaker: string | null = null

    const record = (detail: FountainCategoryDetail, value: string) => {
        detail.count += 1
        if (detail.example === null) detail.example = value
    }

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i] ?? ''
        const line = rawLine.trim()

        if (inBlockComment) {
            if (line.includes('*/')) inBlockComment = false
            continue
        }
        if (line.startsWith('/*')) {
            if (!line.includes('*/')) inBlockComment = true
            continue
        }
        if (line.length === 0) {
            currentSpeaker = null
            continue
        }
        if (line === '===') continue
        if (TITLE_HEADER_REGEX.test(line)) continue
        if (/^(INT\.|EXT\.|INT\/EXT\.|EST\.)/i.test(line)) {
            record(report.sluglines, line)
            currentSpeaker = null
            continue
        }
        if (isFountainTransitionLine(line)) {
            record(report.transitions, line)
            currentSpeaker = null
            continue
        }
        if (isFountainParenthetical(line)) {
            record(report.parentheticals, line)
            continue
        }
        if (isFountainCharacterCue(line)) {
            const normalized = normalizeSpeakerCue(line)
            record(report.characterCues, normalized)
            currentSpeaker = normalized
            continue
        }
        if (currentSpeaker !== null) {
            record(report.dialogueLines, line)
        } else {
            record(report.actionLines, line)
        }
    }

    report.allValid =
        report.sluglines.count > 0 &&
        report.actionLines.count > 0 &&
        report.characterCues.count > 0 &&
        report.parentheticals.count > 0 &&
        report.dialogueLines.count > 0 &&
        report.transitions.count > 0 &&
        report.dateHeader !== null &&
        report.startTimeHm !== null

    return report
}

export function extractFountainActionLines(fountainText: string): string[] {
    if (!fountainText || fountainText.trim().length === 0) {
        return []
    }

    const lines = fountainText.replace(/\r\n/g, '\n').split('\n')
    const actionLines: string[] = []

    let currentSpeaker: string | null = null
    let inTitlePage = true
    let inBlockComment = false
    let actionBuffer: string[] = []

    const flushAction = () => {
        if (actionBuffer.length > 0) {
            const actionText = actionBuffer.join(' ').trim()
            if (actionText.length > 0) {
                actionLines.push(actionText)
            }
            actionBuffer = []
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i]
        const line = rawLine.trim()

        if (inBlockComment) {
            if (line.includes('*/')) {
                inBlockComment = false
            }
            continue
        }
        if (line.startsWith('/*')) {
            if (!line.includes('*/')) {
                inBlockComment = true
            }
            continue
        }

        if (inTitlePage) {
            if (line === '===') {
                inTitlePage = false
                continue
            }
            if (
                TITLE_HEADER_REGEX.test(line) ||
                line.length === 0 ||
                line.startsWith(' ')
            ) {
                continue
            }
            inTitlePage = false
        }

        if (line.length === 0) {
            flushAction()
            currentSpeaker = null
            continue
        }

        if (/^(INT\.|EXT\.|INT\/EXT\.|EST\.)/i.test(line)) {
            flushAction()
            currentSpeaker = null
            continue
        }

        if (
            /^[A-Z\s]+ TO:$/.test(line) ||
            line === 'FADE OUT.' ||
            line === 'CUT TO:' ||
            line === '==='
        ) {
            flushAction()
            currentSpeaker = null
            continue
        }

        if (isFountainCharacterCue(line) && !currentSpeaker) {
            flushAction()
            currentSpeaker = normalizeSpeakerCue(line)
            continue
        }

        // Parentheticals
        if (line.startsWith('(') && line.endsWith(')')) {
            continue
        }

        if (!currentSpeaker) {
            // Each non-empty action line inside a paragraph is preserved so individual Foley cues can match
            actionBuffer.push(line)
            flushAction()
        }
    }

    flushAction()

    return actionLines
}
