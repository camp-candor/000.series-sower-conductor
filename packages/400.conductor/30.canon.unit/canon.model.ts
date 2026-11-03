import Canon, { BibleState } from './fce/canon.interface.js'

export class CanonModel implements Canon {
    idx: string = '30.canon.unit'
    activeSeriesSlug: string = 'wiregrass-basin'
    activeMerkleRoot: string =
        '0000000000000000000000000000000000000000000000000000000000000000'
    isFrozen: boolean = false
    activeCanon: Readonly<BibleState> | null = null
}
