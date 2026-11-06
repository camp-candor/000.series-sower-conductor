import { Model } from '../../99.core/interface/model.interface.js'
import { SwangleRenderReceipt } from './renderOptions.interface.js'

export interface CameraZoomTarget {
    x: number
    y: number
    scaleStart?: number
    scaleEnd?: number
}

export interface SceneShotPlan {
    shotIndex: number
    durationFrames: number
    fromFrame: number
    speakerId: string
    dialogueText: string
    audioWavPath: string
    videoPlatePath: string
    bgMattePath: string
    cameraZoom?: CameraZoomTarget
    trimEndFrames?: number
}

export interface StampCompositionOptions {
    outputDirectory?: string
    upstreamAstHash?: string
    ambientLoopPath?: string
    audioOnly?: boolean
    foleyClips?: Array<{
        clipId: string
        foleyPath: string
        fromFrame: number
        durationInFrames: number
        volumeLinear: number
    }>
}

export interface StampCompositionReceipt {
    ok: boolean
    sceneId: string
    destinationPath: string
    totalFrames: number
    shotCount: number
    checksumSha256: string
    wasClobberRefused: boolean
    lifecycleStatus: 'generated' | 'candidate'
    t0Spend: '$0.00'
    error?: string
}

export interface RemotionState extends Model {
    idx: string
    status: string
    lastStampedSceneId: string | null
    lastStampedFilePath: string | null
    lastChecksumSha256: string | null
    lastActionTimestamp: number
}

export type LayerType =
    | 'ENVIRONMENT_MATTE'
    | 'ATMOSPHERE_VECTOR'
    | 'CHARACTER_PLATE'
    | 'OPTICAL_LENS'

export type CameraMotionMode =
    'STATIC' | 'SLOW_PUSH_IN' | 'CRASH_ZOOM' | 'IMPACT_SHAKE'

export interface SpringPhysicsConfig {
    mass: number
    damping: number
    stiffness: number
    overshootClamping: boolean
}

export interface JitterOffsetKeyframe {
    frame: number
    deltaX: number
    deltaY: number
}

export interface CameraKinematicsSpec {
    mode: CameraMotionMode
    originXPercent: number
    originYPercent: number
    startScale: number
    targetScale: number
    springConfig?: SpringPhysicsConfig
    jitterKeyframes?: JitterOffsetKeyframe[]
}

export interface OpticalMasteringConfig {
    halationIntensityBps: number
    filmGrainOpacityBps: number
    colorLookupTable: string
    enableDespill: boolean
}

export interface AcousticDuckingKeyframe {
    frame: number
    gainDb: number
}

export interface SequenceLayerSpec {
    layerId: string
    layerType: LayerType
    assetPath: string
    fromFrame: number
    durationInFrames: number
    trimEndFrames: number
    zIndex: number
    transformOriginX: number
    transformOriginY: number
    cameraSpec?: CameraKinematicsSpec
}

export interface CompositionMetadata {
    episodeId: string
    sceneId: string
    fps: 24
    width: 1920
    height: 1080
    totalDurationFrames: number
    outputTsxPath: string
    layers: SequenceLayerSpec[]
    duckingTimeline: AcousticDuckingKeyframe[]
    opticalConfig: OpticalMasteringConfig
}

export interface EjectMarkerStatus {
    isLocked: boolean
    filePath: string
    lockTimestampMs?: number
    lockAuthor?: string
}

export interface MeuRemediationTicket {
    ticketId: string
    targetFile: string
    componentName: string
    propName: string
    newValue: string | number
    cycleCount: number
    reason: string
}

export interface StoryArchitectDossier {
    dossierId: string
    ticketId: string
    targetFile: string
    componentName: string
    failedAttempts: number
    escalatedAtMs: number
    reason: string
    status: 'TIER_3_QUARANTINED'
}

export interface UniversalProvenanceManifest {
    manifestVersion: '1.0.0'
    episodeId: string
    sceneId: string
    sealedAtMs: number
    gitCommitSha: string
    canonMerkleRoot: string
    toolchain: {
        nodeVersion: string
        remotionVersion: string
    }
    assetDigests: Record<string, string>
}

export default interface Remotion extends RemotionState {
    idx: string
    totalCompositionsStamped: number
    lastStampedPath: string
    isEjectLocked: boolean
    compilerVersion: string
    lastMetadata: CompositionMetadata | null
    activeDossiers: Record<string, StoryArchitectDossier>
    lastRenderReceipt?: SwangleRenderReceipt | null
}
