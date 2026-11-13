import type Somaticdsp from './fce/somaticdsp.interface.js'
import type {
    CharacterSomaticState,
    SomaticDspReceipt,
    TTSGenerationPayload,
} from './fce/somaticdsp.interface.js'

export class SomaticdspModel implements Somaticdsp {
    idx = '10.somaticdsp'
    characterProfiles: Record<string, CharacterSomaticState> = {}
    lastReceipt?: SomaticDspReceipt
    totalTranslationsExecuted: number = 0
    lastTranslatedPayload: TTSGenerationPayload | null = null
}
