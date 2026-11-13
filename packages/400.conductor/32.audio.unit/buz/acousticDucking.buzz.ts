import { AudioModel } from '../audio.model.js'
import type AudioBit from '../fce/audio.bit.js'
import type {
    DialogueWindow,
    SilenceWindow,
    DuckingGainNode,
    FoleyCueItem,
    MultiTrackAudioPlan,
} from '../fce/audio.interface.js'
import type State from '../../99.core/state.js'

export const ATTACK_FRAMES = 6
export const RELEASE_FRAMES = 12
export const DEFAULT_ATTENUATION_DB = -14.0
export const DEFAULT_BASE_VOLUME = 0.4

export const calculateDuckedVolume = (
    baseVolume: number,
    attenuationDb = DEFAULT_ATTENUATION_DB,
): number => {
    const linearMultiplier = Math.pow(10, attenuationDb / 20)
    return Math.round(baseVolume * linearMultiplier * 10000 + 1e-6) / 10000
}

export const computeSingleWindowGain = (
    frame: number,
    startFrame: number,
    endFrame: number,
    baseGain: number,
    duckedGain: number,
    attackFrames = ATTACK_FRAMES,
    releaseFrames = RELEASE_FRAMES,
): number => {
    if (frame < startFrame - attackFrames) return baseGain

    if (frame >= startFrame - attackFrames && frame < startFrame) {
        const t = (frame - (startFrame - attackFrames)) / attackFrames
        const progress = t * (2 - t)
        return (
            Math.round(
                (baseGain - (baseGain - duckedGain) * progress) * 10000 + 1e-6,
            ) / 10000
        )
    }

    if (frame >= startFrame && frame <= endFrame) {
        return duckedGain
    }

    if (frame > endFrame && frame <= endFrame + releaseFrames) {
        const t = (frame - endFrame) / releaseFrames
        const progress = t * t
        return (
            Math.round(
                (duckedGain + (baseGain - duckedGain) * progress) * 10000 +
                    1e-6,
            ) / 10000
        )
    }

    return baseGain
}

export const computeMultiWindowDuckingCurve = (
    windows: DialogueWindow[],
    totalFrames: number,
    baseVolume = DEFAULT_BASE_VOLUME,
    attenuationDb = DEFAULT_ATTENUATION_DB,
    silences: SilenceWindow[] = [],
): DuckingGainNode[] => {
    if (totalFrames <= 0) return []
    const duckedVolume = calculateDuckedVolume(baseVolume, attenuationDb)
    const keyframes: DuckingGainNode[] = []

    for (let f = 0; f < totalFrames; f++) {
        let minGain = baseVolume

        for (const win of windows) {
            const g = computeSingleWindowGain(
                f,
                win.from_frame,
                win.to_frame,
                baseVolume,
                duckedVolume,
            )
            if (g < minGain) {
                minGain = g
            }
        }

        for (const silence of silences) {
            if (f >= silence.from_frame && f <= silence.to_frame) {
                const silenceMultiplier = Math.pow(
                    10,
                    silence.duck_ambient_db / 20,
                )
                minGain = Math.min(
                    minGain,
                    Math.round(baseVolume * silenceMultiplier * 10000 + 1e-6) /
                        10000,
                )
            }
        }

        keyframes.push({
            frame: f,
            gain: Math.round(minGain * 10000 + 1e-6) / 10000,
        })
    }

    return keyframes
}

export const murmurHash3 = (key: string, seed = 0): number => {
    let k1 = 0
    let h1 = seed >>> 0
    const remainder = key.length & 3
    const bytes = key.length - remainder

    for (let i = 0; i < bytes; i += 4) {
        k1 =
            (key.charCodeAt(i) & 0xff) |
            ((key.charCodeAt(i + 1) & 0xff) << 8) |
            ((key.charCodeAt(i + 2) & 0xff) << 16) |
            ((key.charCodeAt(i + 3) & 0xff) << 24)

        k1 = Math.imul(k1, 0xcc9e2d51)
        k1 = (k1 << 15) | (k1 >>> 17)
        k1 = Math.imul(k1, 0x1b873593)

        h1 ^= k1
        h1 = (h1 << 13) | (h1 >>> 19)
        h1 = Math.imul(h1, 5) + 0xe6546b64
    }

    k1 = 0
    switch (remainder) {
        case 3:
            k1 ^= (key.charCodeAt(bytes + 2) & 0xff) << 16
        case 2:
            k1 ^= (key.charCodeAt(bytes + 1) & 0xff) << 8
        case 1:
            k1 ^= key.charCodeAt(bytes) & 0xff
            k1 = Math.imul(k1, 0xcc9e2d51)
            k1 = (k1 << 15) | (k1 >>> 17)
            k1 = Math.imul(k1, 0x1b873593)
            h1 ^= k1
    }

    h1 ^= key.length
    h1 ^= h1 >>> 16
    h1 = Math.imul(h1, 0x85ebca6b)
    h1 ^= h1 >>> 13
    h1 = Math.imul(h1, 0xc2b2ae35)
    h1 ^= h1 >>> 16

    return h1 >>> 0
}

export const resolveDeterministicFoleyCue = (
    sceneId: string,
    shotId: string,
    cueName: string,
    frameOffset: number,
    availableSamples: string[],
): FoleyCueItem => {
    const seedKey = `${sceneId}:${shotId}:${cueName}`
    const hash = murmurHash3(seedKey)
    const sampleIndex =
        availableSamples.length > 0 ? hash % availableSamples.length : 0
    const resolvedSample = availableSamples[sampleIndex] || `${cueName}_01.wav`

    return {
        shot_id: shotId,
        frame_offset: frameOffset,
        cue_name: cueName,
        resolved_sample: resolvedSample,
        volume: 0.8,
    }
}

export const initAudio = (
    cpy: AudioModel,
    bal: AudioBit,
    _ste?: State,
): AudioModel => {
    cpy.idx = bal.idx || '32.audio'
    if (bal.slv) {
        bal.slv({ audBit: { idx: 'init-audio', val: 0 } })
    }
    return cpy
}

export const updateAudio = (
    cpy: AudioModel,
    bal: AudioBit,
    _ste?: State,
): AudioModel => {
    if (bal.slv) {
        bal.slv({ audBit: { idx: 'update-audio', val: 0 } })
    }
    return cpy
}

export const computeDuckingCurve = async (
    cpy: AudioModel,
    bal: AudioBit,
    ste?: State,
): Promise<AudioModel> => {
    const totalFrames = bal.dat?.totalFrames || 0
    const windows =
        bal.dat?.dialogueWindows || (bal.dat as any)?.dialogue_windows || []
    const silences =
        bal.dat?.silenceWindows || (bal.dat as any)?.silence_windows || []
    const baseVolume = bal.dat?.baseVolume ?? DEFAULT_BASE_VOLUME
    const attenuationDb = bal.dat?.attenuationDb ?? DEFAULT_ATTENUATION_DB

    const emit = async (msg: string) => {
        if (ste && typeof ste.hunt === 'function') {
            await ste
                .hunt('[Console action] Update Console', {
                    idx: 'cns00',
                    src: msg,
                })
                .catch(() => {})
        } else if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: msg,
            }).catch(() => {})
        } else if (global.LIBRARY) {
            await global.LIBRARY.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: msg,
            }).catch(() => {})
        }
    }

    if (totalFrames <= 0) {
        const errorMsg = 'DUCKING_ERROR: Total frames must be greater than zero'
        await emit(`:: [DUCKING:FAIL] ${errorMsg}`)
        if (bal.slv) {
            bal.slv({ audBit: { idx: 'compute-ducking-curve-fail', val: -1 } })
        }
        return cpy
    }

    await emit(
        `>> [DUCKING:INIT] Evaluating multi-window min-reduction over ${totalFrames} frames with ${windows.length} dialogue window(s)...`,
    )

    const gainCurve = computeMultiWindowDuckingCurve(
        windows,
        totalFrames,
        baseVolume,
        attenuationDb,
        silences,
    )

    const foleyCues: FoleyCueItem[] = []
    if (bal.dat?.foleyRequests) {
        for (const req of bal.dat.foleyRequests) {
            foleyCues.push(
                resolveDeterministicFoleyCue(
                    req.sceneId,
                    req.shotId,
                    req.cueName,
                    req.frameOffset,
                    req.availableSamples,
                ),
            )
        }
    }

    const duckedVol = calculateDuckedVolume(baseVolume, attenuationDb)
    await emit(
        `>> [DUCKING:OK] Generated ${gainCurve.length} gain keyframes (Base=${baseVolume}, Ducked=${duckedVol} at ${attenuationDb} dB)`,
    )

    const plan: MultiTrackAudioPlan = {
        total_frames: totalFrames,
        base_volume: baseVolume,
        attenuation_db: attenuationDb,
        dialogue_windows: windows,
        silence_windows: silences,
        gain_curve: gainCurve,
        foley_cues: foleyCues,
    }

    cpy.lastPlan = plan

    if (bal.slv) {
        bal.slv({
            audBit: {
                idx: 'compute-ducking-curve-success',
                val: gainCurve.length,
                dat: { audioPlan: plan },
            },
        })
    }

    return cpy
}
