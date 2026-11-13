// packages/400.conductor/32.audio.unit/audio.buzzer.ts
export {
    initAudio,
    updateAudio,
    computeDuckingCurve,
    calculateDuckedVolume,
    computeSingleWindowGain,
    computeMultiWindowDuckingCurve,
    murmurHash3,
    resolveDeterministicFoleyCue,
} from './buz/acousticDucking.buzz.js'
export {
    assembleAcousticExposureSheet,
    assembleExposureSheetDocument,
} from './buz/audio.buzz.js'
export {
    PARALLAX_FOLEY_REGISTRY,
    mulberry32,
    matchActionLinesToFoleyPlacements,
    mergeCloseSpeechWindows,
    compileParallaxExposureSheet,
} from './buz/foleyMatcher.buzz.js'
