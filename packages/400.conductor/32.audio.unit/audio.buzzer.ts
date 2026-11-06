// packages/400.conductor/32.audio.unit/audio.buzzer.ts
export {
    initAudio,
    updateAudio,
    assembleAcousticExposureSheet,
    assembleExposureSheetDocument,
} from './buz/audio.buzz.js'
export {
    calculateDuckedVolume,
    computeSingleWindowGain,
    computeMultiWindowDuckingCurve,
    ATTACK_FRAMES,
    RELEASE_FRAMES,
    ATTENUATION_DB,
} from './buz/duckingCalculator.buzz.js'
export {
    murmurHash3,
    resolveDeterministicFoleyCue,
} from './buz/foleySeeder.buzz.js'
export {
    PARALLAX_FOLEY_REGISTRY,
    mulberry32,
    matchActionLinesToFoleyPlacements,
    mergeCloseSpeechWindows,
    compileParallaxExposureSheet
} from './buz/foleyMatcher.buzz.js'
