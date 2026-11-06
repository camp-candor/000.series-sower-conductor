import { MruBeatNode } from '../fce/sandwich.interface.js'

export function compileSwainMru(nodes: MruBeatNode[]): string {
    const blocks: string[] = [
        '=== DWIGHT SWAIN MRU CAUSAL EXECUTION BLOCKS ===',
    ]

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const indexStr = String(i + 1).padStart(2, '0')

        // Dwight Swain Invariant: Stimulus -> Visceral Reflex -> Conscious Action -> Dialogue
        blocks.push(`\n[MRU BEAT ${indexStr} : ${node.beatId}]`)
        blocks.push(`ACTOR: ${node.characterId}`)
        blocks.push(`PREROLL REACTION INTERVAL: ${node.prerollFrames} frames`)
        blocks.push(`1. MOTIVATING STIMULUS: ${node.motivationStimulus}`)
        blocks.push(`2. INVOLUNTARY VISCERAL REFLEX: ${node.visceralReaction}`)
        blocks.push(`3. CONSCIOUS MOTOR ACTION: ${node.calculatedAction}`)
        blocks.push(`4. SPOKEN DIALOGUE: "${node.dialogueText}"`)
    }

    return blocks.join('\n')
}
