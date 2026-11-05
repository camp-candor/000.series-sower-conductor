import Remotion, {
    CompositionMetadata,
    StoryArchitectDossier,
} from './fce/remotion.interface.js'
import { SwangleRenderReceipt } from './fce/renderOptions.interface.js'

export class RemotionModel implements Remotion {
    idx: string = '35.remotion.unit'
    totalCompositionsStamped: number = 0
    lastStampedPath: string = ''
    isEjectLocked: boolean = false
    compilerVersion: string = '1.0.0'
    lastMetadata: CompositionMetadata | null = null
    activeDossiers: Record<string, StoryArchitectDossier> = {}
    lastRenderReceipt?: SwangleRenderReceipt | null = null
    lastActionTimestamp?: number = 0
}
