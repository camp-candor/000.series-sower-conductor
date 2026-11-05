import ConductorUnit from './00.conductor.unit/conductor.unit.js'
import LogisticUnit from './04.logistic.unit/logistic.unit.js'
import SqliteUnit from './08.sqlite.unit/sqlite.unit.js'
import SpeechUnit from './09.speech.unit/speech.unit.js'
import SomaticdspUnit from './10.somaticdsp.unit/somaticdsp.unit.js';
import Somaticdsp from './10.somaticdsp.unit/fce/somaticdsp.interface.js';
import { SomaticdspModel } from './10.somaticdsp.unit/somaticdsp.model.js';
import { reducer as somaticdspReducer } from './10.somaticdsp.unit/somaticdsp.reduce.js';
import LedgerUnit from './21.ledger.unit/ledger.unit.js'
import FrameUnit from './24.frame.unit/frame.unit.js'
import VramUnit from './26.vram.unit/vram.unit.js'
import CudaUnit from './27.cuda.unit/cuda.unit.js'
import CpusUnit from './28.cpus.unit/cpus.unit.js'
import ContinuityUnit from './29.continuity.unit/continuity.unit.js'
import CanonUnit from './30.canon.unit/canon.unit.js'
import AudioUnit from './32.audio.unit/audio.unit.js'
import AssetUnit from './33.asset.unit/asset.unit.js'
import AbstractSyntaxTreeUnit from './34.abstractsyntaxtree.unit/abstractsyntaxtree.unit.js'
import RemotionUnit from './35.remotion.unit/remotion.unit.js'
import EdgeBridgeUnit from './36.edgebridge.unit/edgebridge.unit.js'
import LifecycleUnit from './37.lifecycle.unit/lifecycle.unit.js'
import MenuUnit from './98.menu.unit/menu.unit.js'
import { RemotionModel } from './35.remotion.unit/remotion.model.js'
import { EdgeBridgeModel } from './36.edgebridge.unit/edgebridge.model.js'
import { LifecycleModel } from './37.lifecycle.unit/lifecycle.model.js'
import { Model } from './99.core/interface/model.interface.js'

export const list: Array<any> = [
    ConductorUnit,
    LogisticUnit,
    SqliteUnit,
    SpeechUnit,
    SomaticdspUnit,
    LedgerUnit,
    FrameUnit,
    VramUnit,
    CudaUnit,
    CpusUnit,
    ContinuityUnit,
    CanonUnit,
    AudioUnit,
    AssetUnit,
    AbstractSyntaxTreeUnit,
    RemotionUnit,
    EdgeBridgeUnit,
    LifecycleUnit,
    MenuUnit,
]

import * as reduceFromConductor from './00.conductor.unit/conductor.reduce.js'
import * as reduceFromLogistic from './04.logistic.unit/logistic.reduce.js'
import * as reduceFromSqlite from './08.sqlite.unit/sqlite.reduce.js'
import * as reduceFromSpeech from './09.speech.unit/speech.reduce.js'
import * as reduceFromSomaticdsp from './10.somaticdsp.unit/somaticdsp.reduce.js'
import * as reduceFromLedger from './21.ledger.unit/ledger.reduce.js'
import * as reduceFromFrame from './24.frame.unit/frame.reduce.js'
import * as reduceFromVram from './26.vram.unit/vram.reduce.js'
import * as reduceFromCuda from './27.cuda.unit/cuda.reduce.js'
import * as reduceFromCpus from './28.cpus.unit/cpus.reduce.js'
import * as reduceFromContinuity from './29.continuity.unit/continuity.reduce.js'
import * as reduceFromCanon from './30.canon.unit/canon.reduce.js'
import * as reduceFromAudio from './32.audio.unit/audio.reduce.js'
import * as reduceFromAsset from './33.asset.unit/asset.reduce.js'
import * as reduceFromAST from './34.abstractsyntaxtree.unit/abstractsyntaxtree.reduce.js'
import * as reduceFromRemotion from './35.remotion.unit/remotion.reduce.js'
import * as reduceFromEdgeBridge from './36.edgebridge.unit/edgebridge.reduce.js'
import * as reduceFromLifecycle from './37.lifecycle.unit/lifecycle.reduce.js'
import * as reduceFromMenu from './98.menu.unit/menu.reduce.js'

export const reducer: any = {
    conductor: reduceFromConductor.reducer,
    logistic: reduceFromLogistic.reducer,
    sqlite: reduceFromSqlite.reducer,
    speech: reduceFromSpeech.reducer,
    somaticdsp: reduceFromSomaticdsp.reducer,
    ledger: reduceFromLedger.reducer,
    frame: reduceFromFrame.reducer,
    vram: reduceFromVram.reducer,
    cuda: reduceFromCuda.reducer,
    cpus: reduceFromCpus.reducer,
    continuity: reduceFromContinuity.reducer,
    canon: reduceFromCanon.reducer,
    audio: reduceFromAudio.reducer,
    asset: reduceFromAsset.reducer,
    ast: reduceFromAST.reducer,
    remotion: reduceFromRemotion.reducer,
    edgebridge: reduceFromEdgeBridge.reducer,
    lifecycle: reduceFromLifecycle.reducer,
    menu: reduceFromMenu.reducer,
}

// prettier-ignore
export default class UnitData implements Model {
  idx: string = '400.conductor';
  conductor: any;
  logistic: any;
  sqlite: any;
  speech: any;
  somaticdsp: Somaticdsp = new SomaticdspModel();
  ledger: any;
  frame: any;
  vram: any;
  cuda: any;
  cpus: any;
  continuity: any;
  canon: any;
  audio: any;
  asset: any;
  ast: any;
  remotion: any = new RemotionModel();
  edgebridge: any = new EdgeBridgeModel();
  lifecycle: any = new LifecycleModel();
  menu: any;
}
