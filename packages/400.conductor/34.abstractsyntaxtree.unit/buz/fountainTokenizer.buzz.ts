import { ExtractedDialogueTurn } from '../fce/parity.interface.js'

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

        // Character Cue: Uppercase string without lowercase characters
        const isCharacterCue =
            /^[A-Z0-9\s_'-]+$/.test(line) &&
            !line.startsWith('INT.') &&
            !line.startsWith('EXT.') &&
            line.length <= 40

        if (isCharacterCue && !currentSpeaker) {
            currentSpeaker = line.replace(/\s*\^$/, '').trim() // Strip dual dialogue marker if present
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
