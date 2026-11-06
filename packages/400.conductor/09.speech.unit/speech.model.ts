import Speech, { SceneSpeechReceipt } from './fce/speech.interface.js'

export class SpeechModel implements Speech {
    idx: string = '09.speech'
    isProcessing: boolean = false
    totalStemsSynthesized: number = 0
    lastSceneReceipt?: SceneSpeechReceipt
}
