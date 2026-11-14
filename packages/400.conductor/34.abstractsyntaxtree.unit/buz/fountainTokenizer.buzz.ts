import { ExtractedDialogueTurn } from '../fce/parity.interface.js'

const CUE_EXTENSION_REGEX =
    /\s*\((?:CONT'D|CONT\u2019D|O\.S\.|V\.O\.|OFF)\)\s*$/i
const TITLE_HEADER_REGEX =
    /^(Title|Credit|Author|Draft date|Contact|Series|Scene|Date|Start-Time|Timecode|Daypart|Timezone|Era):/i

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
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const HM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
const HMS_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/

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
                if (!DATE_REGEX.test(value)) {
                    throw new Error(
                        `CHRONOLOGY_INVALID_DATE: Date [${value}] must match YYYY-MM-DD`,
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
            default:
                break
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
