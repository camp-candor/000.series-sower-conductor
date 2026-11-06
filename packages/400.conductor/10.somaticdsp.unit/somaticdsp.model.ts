import Somaticdsp, {
    CharacterSomaticState,
    SomaticDspReceipt,
    TTSGenerationPayload,
} from './fce/somaticdsp.interface.js'

export class SomaticdspModel implements Somaticdsp {
    idx: string = '10.somaticdsp'
    totalTranslationsExecuted: number = 0
    lastTranslatedPayload: TTSGenerationPayload | null = null
    characterProfiles: Record<string, CharacterSomaticState> = {}
    lastReceipt?: SomaticDspReceipt
}
