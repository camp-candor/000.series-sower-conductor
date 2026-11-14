import { SceneModel } from '../scene.model.js'
import SceneBit from '../fce/scene.bit.js'
import State from '../../99.core/state.js'

export interface TransitionRule {
    transitionType: string
    rawLine: string
    pauseFrames: number
}

export function mapTransitionToPauseFrames(rawTransition: string): number {
    const t = String(rawTransition ?? '')
        .trim()
        .toUpperCase()
    if (t.includes('SMASH CUT TO:')) return 0
    if (t.startsWith('TIME CUT:') || t.includes('TIME CUT:')) return 24
    if (t.includes('DISSOLVE TO:')) return 18
    if (t === 'FADE OUT.' || t.includes('FADE OUT.')) return 36
    if (t === 'FADE IN:' || t.includes('FADE IN:')) return 12
    if (t.endsWith(' TO:')) return 4
    if (t.startsWith('>')) return 4
    return 4
}

export function extractSceneTransitions(
    fountainText: string,
): TransitionRule[] {
    if (!fountainText || fountainText.trim().length === 0) return []
    const lines = fountainText.replace(/\r\n/g, '\n').split('\n')
    const rules: TransitionRule[] = []
    let inBlockComment = false
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
        if (line.length === 0) continue
        if (line === '===') continue
        const upper = line.toUpperCase()
        let isTransition = false
        let transitionType = line
        if (line.startsWith('>')) {
            isTransition = true
            transitionType = line.slice(1).trim() || 'CUT'
        } else if (/^[A-Z0-9\s]+ TO:$/.test(line)) {
            isTransition = true
            transitionType = line
        } else if (line === 'FADE OUT.' || line === 'FADE IN:') {
            isTransition = true
            transitionType = line
        } else if (/^TIME CUT:/i.test(line)) {
            isTransition = true
            transitionType = 'TIME CUT'
        } else if (
            upper === 'SMASH CUT TO:' ||
            upper === 'CUT TO:' ||
            upper === 'DISSOLVE TO:'
        ) {
            isTransition = true
            transitionType = line
        }
        if (isTransition) {
            rules.push({
                transitionType,
                rawLine: line,
                pauseFrames: mapTransitionToPauseFrames(line),
            })
        }
    }
    return rules
}

export const initScene = (cpy: SceneModel, bal: SceneBit, ste: State) => {
    return cpy
}

export const updateScene = (cpy: SceneModel, bal: SceneBit, ste: State) => {
    return cpy
}

export const parseSceneTransitions = (
    cpy: SceneModel,
    bal: SceneBit,
    _ste: State,
) => {
    const text = String(bal.dat?.fountainText ?? bal.src ?? '')
    const transitions = extractSceneTransitions(text)
    if (bal.slv)
        bal.slv({
            scnBit: {
                idx: 'parse-scene-transitions-success',
                val: 1,
                dat: { transitions },
            },
        })
    return cpy
}
