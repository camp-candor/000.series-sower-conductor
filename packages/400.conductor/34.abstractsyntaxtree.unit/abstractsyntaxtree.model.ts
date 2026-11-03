import AbstractSyntaxTree, {
    SceneAST,
} from './fce/abstractsyntaxtree.interface.js'

export class AbstractSyntaxTreeModel implements AbstractSyntaxTree {
    idx: string = '34.abstractsyntaxtree.unit'
    lastParsedSceneId: string = 'NONE'
    totalLinesValidated: number = 0
    activeScene: Readonly<SceneAST> | null = null
}
