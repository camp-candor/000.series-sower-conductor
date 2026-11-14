import { DialogueModel } from '../dialogue.model.js'
import DialogueBit from '../fce/dialogue.bit.js'
import State from '../../99.core/state.js'
import {
    isFountainCharacterCue,
    isFountainTransitionLine,
    normalizeSpeakerCue,
} from '../../34.abstractsyntaxtree.unit/buz/fountainTokenizer.buzz.js'

export interface DialogueTurnWithParenthetical {
    turnIndex: number
    speaker: string
    parenthetical: string | null
    dialogueText: string
}

const TITLE_HEADER_REGEX =
    /^(Title|Credit|Author|Draft date|Contact|Series|Scene|Date|Start-Time|Timecode|Daypart|Timezone|Era):/i

export function sanitizeDialogueAscii(input: string): string {
    return String(input ?? '')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^\x20-\x7E\r\n\t]/g, '')
        .trim()
}

export function extractDialogueTurnsWithParentheticals(
    fountainText: string,
): DialogueTurnWithParenthetical[] {
    if (!fountainText || fountainText.trim().length === 0) return []
    const lines = fountainText.replace(/\r\n/g, '\n').split('\n')
    const turns: DialogueTurnWithParenthetical[] = []
    let inBlockComment = false
    let currentSpeaker: string | null = null
    let pendingParenthetical: string | null = null
    for (const rawLine of lines) {
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
            pendingParenthetical = null
            continue
        }
        if (line === '===') continue
        if (TITLE_HEADER_REGEX.test(line)) continue
        if (/^(INT\.|EXT\.|INT\/EXT\.|EST\.)/i.test(line)) {
            currentSpeaker = null
            pendingParenthetical = null
            continue
        }
        if (isFountainTransitionLine(line)) {
            currentSpeaker = null
            pendingParenthetical = null
            continue
        }
        if (/^\([^)]+\)$/.test(line)) {
            if (currentSpeaker !== null) {
                pendingParenthetical = sanitizeDialogueAscii(
                    line.slice(1, -1).trim(),
                )
            }
            continue
        }
        if (isFountainCharacterCue(line)) {
            currentSpeaker = sanitizeDialogueAscii(normalizeSpeakerCue(line))
            pendingParenthetical = null
            continue
        }
        if (currentSpeaker !== null) {
            turns.push({
                turnIndex: turns.length,
                speaker: currentSpeaker,
                parenthetical: pendingParenthetical,
                dialogueText: sanitizeDialogueAscii(line),
            })
            pendingParenthetical = null
        }
    }
    return turns
}

export const initDialogue = (
    cpy: DialogueModel,
    bal: DialogueBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ dialogueBit: { idx: 'init-dialogue', val: 1 } })
    return cpy
}

export const updateDialogue = (
    cpy: DialogueModel,
    bal: DialogueBit,
    _ste: State,
) => {
    if (bal.slv) bal.slv({ dialogueBit: { idx: 'update-dialogue', val: 1 } })
    return cpy
}

export const extractParentheticalCues = (
    cpy: DialogueModel,
    bal: DialogueBit,
    _ste: State,
) => {
    const text = String(bal.dat?.fountainText ?? bal.src ?? '')
    const turns = extractDialogueTurnsWithParentheticals(text)
    if (bal.slv)
        bal.slv({
            dlgBit: {
                idx: 'extract-parenthetical-cues-success',
                val: 1,
                dat: { turns },
            },
        })
    return cpy
}
