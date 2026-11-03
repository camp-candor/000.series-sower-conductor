import Speech, { SceneSynthesisResult } from './fce/speech.interface.js'

export class SpeechModel implements Speech {
    idx: string = '09.speech.unit'
    endpointUrl: string = 'http://127.0.0.1:8000'
    scratchOutputDir: string = 'scratch/audio/dialogue'
    totalStemsSynthesized: number = 0
    lastSceneResult: SceneSynthesisResult | null = null
}
