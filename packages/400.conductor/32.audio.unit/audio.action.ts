// packages/400.conductor/32.audio.unit/audio.action.ts
import type { Action } from '../99.core/interface/action.interface.js'
import type AudioBit from './fce/audio.bit.js'

export const INIT_AUDIO = '[Audio action] Init Audio'
export class InitAudio implements Action<AudioBit> {
    readonly type = INIT_AUDIO
    constructor(public bale: AudioBit) {}
}

export const UPDATE_AUDIO = '[Audio action] Update Audio'
export class UpdateAudio implements Action<AudioBit> {
    readonly type = UPDATE_AUDIO
    constructor(public bale: AudioBit) {}
}

export const ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET =
    '[Audio action] Assemble Acoustic Exposure Sheet'
export class AssembleAcousticExposureSheet implements Action<AudioBit> {
    readonly type = ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET
    constructor(public bale: AudioBit) {}
}

export const COMPUTE_DUCKING_CURVE = '[Audio action] Compute Ducking Curve'
export class ComputeDuckingCurve implements Action<AudioBit> {
    readonly type = COMPUTE_DUCKING_CURVE
    constructor(public bale: AudioBit) {}
}

export type Actions =
    | InitAudio
    | UpdateAudio
    | AssembleAcousticExposureSheet
    | ComputeDuckingCurve
