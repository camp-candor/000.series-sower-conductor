import { Action } from '../99.core/interface/action.interface.js'
import PipelineBit from './fce/pipeline.bit.js'

// Pipeline actions

export const INIT_PIPELINE = '[Pipeline action] Init Pipeline'
export class InitPipeline implements Action {
    readonly type = INIT_PIPELINE
    constructor(public bale: PipelineBit) {}
}

export const UPDATE_PIPELINE = '[Pipeline action] Update Pipeline'
export class UpdatePipeline implements Action {
    readonly type = UPDATE_PIPELINE
    constructor(public bale: PipelineBit) {}
}

export const BATCH_INGEST_AUTO_SCRIPTS =
    '[Pipeline action] Batch Ingest Auto Scripts'
export class BatchIngestAutoScripts implements Action {
    readonly type = BATCH_INGEST_AUTO_SCRIPTS
    constructor(public bale: PipelineBit) {}
}

export const COMPILE_EPISODE_STACK = '[Pipeline action] Compile Episode Stack'
export class CompileEpisodeStack implements Action {
    readonly type = COMPILE_EPISODE_STACK
    constructor(public bale: PipelineBit) {}
}

export type Actions =
    InitPipeline | UpdatePipeline | BatchIngestAutoScripts | CompileEpisodeStack
