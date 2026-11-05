import {
    CharacterSomaticProfile,
    SomaticCheckResult,
} from '../fce/lifecycle.interface.js'

export function evaluateSomaticCapability(
    cast: CharacterSomaticProfile[] = [],
    requiredVerbs: Record<string, string[]> = {},
): SomaticCheckResult {
    const violatingCharacters: string[] = []
    const reasons: string[] = []

    for (const character of cast) {
        const verbs = requiredVerbs[character.characterId] || []
        const banned = new Set(character.bannedKineticVerbs)

        // 1. Somatic Verb Collision Check
        for (const verb of verbs) {
            if (banned.has(verb)) {
                violatingCharacters.push(character.characterId)
                reasons.push(
                    `SOMATIC_CAPABILITY_BREACH: Character '${character.characterId}' cannot perform '${verb}' due to recorded physiological trauma.`,
                )
            }
        }

        // 2. Anatomical Limb Budget Check
        const twoHandedVerbs = [
            'dual_wield',
            'two_handed_strike',
            'climb_ladder',
            'heavy_lift',
        ]
        for (const verb of verbs) {
            if (
                twoHandedVerbs.includes(verb) &&
                character.functionalLimbs < 2
            ) {
                if (!violatingCharacters.includes(character.characterId)) {
                    violatingCharacters.push(character.characterId)
                }
                reasons.push(
                    `LIMB_CAPACITY_BREACH: Action '${verb}' requires 2 functional limbs, but character '${character.characterId}' possesses only ${character.functionalLimbs}.`,
                )
            }
        }
    }

    return {
        valid: violatingCharacters.length === 0,
        violatingCharacters,
        reasons,
    }
}
