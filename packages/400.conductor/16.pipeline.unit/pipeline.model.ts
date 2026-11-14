import Pipeline, { EpisodeStackManifest } from './fce/pipeline.interface.js'
import PipelineBit from './fce/pipeline.interface.js'

export class PipelineModel implements Pipeline {
    idx: string = '16.pipeline'
    pipelineBitList: PipelineBit[] = []
    pipelineBits: Record<string, unknown> = {}
    lastBatchManifest: EpisodeStackManifest | null = null
    processedSceneCount: number = 0
}
