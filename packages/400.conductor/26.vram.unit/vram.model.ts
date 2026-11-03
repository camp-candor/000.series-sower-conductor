import Vram, { VramHygieneResult } from './fce/vram.interface.js'

export class VramModel implements Vram {
    idx: string = '26.vram.unit'
    endpointUrl: string = 'http://127.0.0.1:8188'
    baselineFreeMb: number = 21000
    toleranceMb: number = 500
    totalFlushesExecuted: number = 0
    lastHygieneResult: VramHygieneResult | null = null
}
