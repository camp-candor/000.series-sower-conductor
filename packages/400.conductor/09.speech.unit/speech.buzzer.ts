export {
    initSpeech,
    updateSpeech,
    executeSceneSpeech,
    buildCliArgs,
    verifyZeroByteSentinel,
    pollFileStabilization,
    synthesizeSingleLineWithRetry,
    verifyNonSilentWavPcm,
} from './buz/speech.buzz.js'

export {
    buildParallaxSpeechRequest,
    executeParallaxSceneSpeech,
} from './buz/parallaxSpeech.buzz.js'
