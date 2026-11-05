import Remotion, {
    CompositionMetadata,
    StoryArchitectDossier,
    RemotionState,
} from './fce/remotion.interface.js'
import { SwangleRenderReceipt } from './fce/renderOptions.interface.js'

export class RemotionModel implements Remotion, RemotionState {
    idx: string = '35.remotion.unit'
    status: string = 'IDLE'
    lastStampedSceneId: string | null = null
    lastStampedFilePath: string | null = null
    lastChecksumSha256: string | null = null
    lastActionTimestamp: number = 0
    totalCompositionsStamped: number = 0
    lastStampedPath: string = ''
    isEjectLocked: boolean = false
    compilerVersion: string = '1.0.0'
    lastMetadata: CompositionMetadata | null = null
    activeDossiers: Record<string, StoryArchitectDossier> = {}
    lastRenderReceipt?: SwangleRenderReceipt | null = null
}
