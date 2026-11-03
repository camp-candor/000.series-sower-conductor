import ConductorUnit from './00.conductor.unit/conductor.unit.js';
import SqliteUnit from './08.sqlite.unit/sqlite.unit.js';
import SpeechUnit from './09.speech.unit/speech.unit.js';
import SomaticdspUnit from './10.somaticdsp.unit/somaticdsp.unit.js';
import LedgerUnit from './21.ledger.unit/ledger.unit.js';
import FrameUnit from './24.frame.unit/frame.unit.js';
import VramUnit from './26.vram.unit/vram.unit.js';
import CudaUnit from './27.cuda.unit/cuda.unit.js';
import CpusUnit from './28.cpus.unit/cpus.unit.js';
import ContinuityUnit from './29.continuity.unit/continuity.unit.js';
import CanonUnit from './30.canon.unit/canon.unit.js';
import AudioUnit from './32.audio.unit/audio.unit.js';
import AssetUnit from './33.asset.unit/asset.unit.js';
import AbstractSyntaxTreeUnit from './34.abstractsyntaxtree.unit/abstractsyntaxtree.unit.js';
import { Model } from './99.core/interface/model.interface.js';

export const list: Array<any> = [
  ConductorUnit,
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
];

import * as reduceFromConductor from './00.conductor.unit/conductor.reduce.js';
import * as reduceFromSqlite from './08.sqlite.unit/sqlite.reduce.js';
import * as reduceFromSpeech from './09.speech.unit/speech.reduce.js';
import * as reduceFromSomaticdsp from './10.somaticdsp.unit/somaticdsp.reduce.js';
import * as reduceFromLedger from './21.ledger.unit/ledger.reduce.js';
import * as reduceFromFrame from './24.frame.unit/frame.reduce.js';
import * as reduceFromVram from './26.vram.unit/vram.reduce.js';
import * as reduceFromCuda from './27.cuda.unit/cuda.reduce.js';
import * as reduceFromCpus from './28.cpus.unit/cpus.reduce.js';
import * as reduceFromContinuity from './29.continuity.unit/continuity.reduce.js';
import * as reduceFromCanon from './30.canon.unit/canon.reduce.js';
import * as reduceFromAudio from './32.audio.unit/audio.reduce.js';
import * as reduceFromAsset from './33.asset.unit/asset.reduce.js';
import * as reduceFromAST from './34.abstractsyntaxtree.unit/abstractsyntaxtree.reduce.js';

export const reducer: any = {
  conductor: reduceFromConductor.reducer,
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
};

// prettier-ignore
export default class UnitData implements Model {
  idx: string = '400.conductor';
  conductor: any;
  sqlite: any;
  speech: any;
  somaticdsp: any;
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
}
