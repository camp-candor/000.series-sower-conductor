// packages/400.conductor/32.audio.unit/buz/foleySeeder.buzz.ts
import { FoleyCueItem } from '../fce/audio.interface.js'

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
