import {
    SceneContextPayload,
    CompiledAttentionSandwich,
} from '../fce/sandwich.interface.js'

export const COUNTER_EXEMPLAR_PAIR = `
[COUNTER-EXEMPLAR CONTRAST PAIR]
REJECTED (Beige Plague / Synthetic Harmony):
"I understand your frustration, Silas. Let us find common ground on this valve before the storm hits."
REQUIRED (Tactical Avoidance / Oblique Evasion):
"Pressure needle is shivering. Keep your hand off the brass until I tell you."
`.trim()

export const SLOP_FILTER_TOKENS = [
    'palpable',
    'testament',
    'tapestry',
    'furthermore',
    'moreover',
    'in summary',
    'a dance of',
    'delicate balance',
    'unspoken understanding',
]

export function compileAttentionSandwich(
    input: SceneContextPayload,
): CompiledAttentionSandwich {
    // 1. TOP 15%: PRIMACY ZONE (Static Universe Axioms, Somatic Masks, Refusal Vectors)
    const topSections: string[] = [
        '[SYSTEM / IMMUTABLE LAWS (TOP 15% PRIMACY)]',
        `SERIES: ${input.seriesSlug}`,
        'WORLD AXIOMS (Negative & Grounding Constraints):',
        ...input.worldAxioms.map((a) => `  * ${a}`),
        '\nCHARACTER REFUSAL VECTORS & SOMATIC MASKS:',
        `Actor: ${input.actorA.id}`,
        ...input.actorA.constraints.refusalVectors.map(
            (r) => `  * REFUSAL: ${r}`,
        ),
        `  * AVAILABLE_ARMS: ${input.actorA.constraints.somaticMask.availableArms}`,
        `  * BANNED_KINETIC_VERBS: [${input.actorA.constraints.somaticMask.bannedKineticVerbs.join(', ')}]`,
        `Actor: ${input.actorB.id}`,
        ...input.actorB.constraints.refusalVectors.map(
            (r) => `  * REFUSAL: ${r}`,
        ),
        `  * AVAILABLE_ARMS: ${input.actorB.constraints.somaticMask.availableArms}`,
        `  * BANNED_KINETIC_VERBS: [${input.actorB.constraints.somaticMask.bannedKineticVerbs.join(', ')}]`,
        '\nANTI-SLOP STYLOMETRIC MANDATE:',
        `  * Banned high-probability AI crutch words: [${SLOP_FILTER_TOKENS.join(', ')}]`,
        '  * Physical nouns take precedence over emotional abstractions.',
        '  * Monosyllabic tactical evasion strictly required.',
        `\n${COUNTER_EXEMPLAR_PAIR}`,
    ]
    const top15Primacy = topSections.join('\n')

    // 2. MIDDLE 70%: CONTEXT TROUGH (Sanitized Passive Momentum, Grievances, Props)
    const middleSections: string[] = [
        '[PASSIVE CONTEXT & MOMENTUM (MIDDLE 70% CONTEXT)]',
    ]

    if (
        input.slidingProseBuffer &&
        input.slidingProseBuffer.trim().length > 0
    ) {
        middleSections.push(
            'RECENT MANUSCRIPT MOMENTUM:\n' + input.slidingProseBuffer.trim(),
        )
    }

    middleSections.push('\nACTIVE SURFACE DISPUTE (Focus of spoken words):')
    middleSections.push(input.surfaceDispute)

    if (
        input.logisticalInventory &&
        Object.keys(input.logisticalInventory).length > 0
    ) {
        middleSections.push('\nPHYSICAL INVENTORY CUSTODY:')
        for (const [actor, items] of Object.entries(
            input.logisticalInventory,
        )) {
            middleSections.push(`  * ${actor} HOLDS: [${items.join(', ')}]`)
        }
    }

    // Subtext Suppression Gate (S >= 0.70): Isolate Underneath behind attenuation directives
    if (input.dramaticParameters.subtextSuppression >= 0.7) {
        middleSections.push('\n[SUBTEXT SUPPRESSION ACTIVE (S >= 0.70)]')
        middleSections.push(
            'THE UNDERNEATH (DO NOT SPEAK DIRECTLY; CHANNEL ONLY INTO PROXIES):',
        )
        middleSections.push(input.theUnderneathSecret)
    }

    const middle70Context = middleSections.join('\n')

    // 3. BOTTOM 15%: RECENCY ZONE (Immediate Triggers, Parameters, Exit Anchors)
    const bottomSections: string[] = [
        '[DYNAMIC ANCHORS & RECENCY (BOTTOM 15% RECENCY)]',
    ]

    if (input.stage0ACollisionMode) {
        bottomSections.push(
            '[STAGE 0A: ZERO-GRAMMAR ZERO-LOGISTICS COLLISION MODE]',
        )
        bottomSections.push(
            'GBNF schemas, equipment slot locks, and door boundaries are STRIPPED.',
        )
        bottomSections.push(
            'DIRECTIVE: Focus 100% of latent capacity on psychological friction.',
        )
        bottomSections.push('UNFORCED COLLISION PREMISE:')
        bottomSections.push(input.unforcedCollisionPremise)
    } else {
        bottomSections.push('OPERATIONAL PARAMETERS:')
        bottomSections.push(
            `  * CURTNESS (C): ${input.dramaticParameters.curtness.toFixed(2)}`,
        )
        bottomSections.push(
            `  * PACING (P): ${input.dramaticParameters.pacing.toFixed(2)}`,
        )
        bottomSections.push(
            `  * THREAT (T): ${input.dramaticParameters.threat.toFixed(2)}`,
        )
        bottomSections.push(
            `  * SUBTEXT (S): ${input.dramaticParameters.subtextSuppression.toFixed(2)}`,
        )

        if (input.bannedTokens && input.bannedTokens.length > 0) {
            bottomSections.push(
                `\nATTENUATION TOKEN BLACKLIST: [${input.bannedTokens.join(', ')}]`,
            )
        }

        bottomSections.push('\nCOLLISION SITUATION:')
        bottomSections.push(input.unforcedCollisionPremise)

        bottomSections.push('\nEXECUTION FORMAT:')
        bottomSections.push(
            '  * Format: Dwight Swain MRU blocks (Stimulus -> Visceral Reflex -> Motor Action/Dialogue).',
        )
        bottomSections.push('  * Scope Cap: 200-250 words maximum.')

        if (input.hardPhysicalExitTrigger) {
            bottomSections.push(
                '\nHARD PHYSICAL EXIT CONDITION (TERMINATE PROMPT IMMEDIATELY ON HIT):',
            )
            bottomSections.push(`  * ${input.hardPhysicalExitTrigger}`)
        }
    }

    const bottom15Recency = bottomSections.join('\n')

    const fullSerializedPrompt = [
        top15Primacy,
        middle70Context,
        bottom15Recency,
    ].join('\n\n---\n\n')

    // Heuristic token calculation (~4 characters per token)
    const primacyTokens = Math.ceil(top15Primacy.length / 4)
    const contextTokens = Math.ceil(middle70Context.length / 4)
    const recencyTokens = Math.ceil(bottom15Recency.length / 4)
    const totalTokens = primacyTokens + contextTokens + recencyTokens

    const primacyPct = Math.round((primacyTokens / totalTokens) * 100)
    const contextPct = Math.round((contextTokens / totalTokens) * 100)
    const recencyPct = Math.round((recencyTokens / totalTokens) * 100)

    return {
        top15Primacy,
        middle70Context,
        bottom15Recency,
        fullSerializedPrompt,
        tokenBudgetEstimates: {
            primacyTokens,
            contextTokens,
            recencyTokens,
            totalTokens,
        },
        topologyPercentages: {
            primacyPct,
            contextPct,
            recencyPct,
        },
    }
}
