import { ExtractedDialogueTurn } from '../fce/parity.interface.js'

const CUE_EXTENSION_REGEX =
    /\s*\((?:CONT'D|CONT\u2019D|O\.S\.|V\.O\.|OFF)\)\s*$/i
const TITLE_HEADER_REGEX = /^(Title|Credit|Author|Draft date|Contact):/i

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

        // Handle title page logic
        if (inTitlePage) {
            if (line === '===') {
                inTitlePage = false
                continue
            }
            if (TITLE_HEADER_REGEX.test(line) || line.length === 0) {
                continue
            }
            // If we encounter a line that isn't a title header and isn't empty, we might not be in a title page
            if (
                line.length > 0 &&
                !TITLE_HEADER_REGEX.test(line) &&
                !line.startsWith('===') &&
                i > 5
            ) {
                inTitlePage = false
            }
            if (inTitlePage && TITLE_HEADER_REGEX.test(line)) {
                continue
            }
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
            // It's an action line
            actionBuffer.push(line)
        }
    }

    flushAction()

    return actionLines
}
