import ConductorUnit from './00.conductor.unit/conductor.unit.js';
import SqliteUnit from './08.sqlite.unit/sqlite.unit.js';
import LedgerUnit from './21.ledger.unit/ledger.unit.js';
import CudaUnit from './27.cuda.unit/cuda.unit.js';
import CpusUnit from './28.cpus.unit/cpus.unit.js';
import CanonUnit from './30.canon.unit/canon.unit.js';
import AssetUnit from './33.asset.unit/asset.unit.js';
import AbstractSyntaxTreeUnit from './34.abstractsyntaxtree.unit/abstractsyntaxtree.unit.js';
import ContinuityUnit from './29.continuity.unit/continuity.unit.js';
import { Model } from './99.core/interface/model.interface.js';

export const list: Array<any> = [
  ConductorUnit,
  SqliteUnit,
  LedgerUnit,
  CudaUnit,
  CpusUnit,
  CanonUnit,
  AssetUnit,
  AbstractSyntaxTreeUnit,
  ContinuityUnit
];

import * as reduceFromConductor from './00.conductor.unit/conductor.reduce.js';
import * as reduceFromSqlite from './08.sqlite.unit/sqlite.reduce.js';
import * as reduceFromLedger from './21.ledger.unit/ledger.reduce.js';
import * as reduceFromCuda from './27.cuda.unit/cuda.reduce.js';
import * as reduceFromCpus from './28.cpus.unit/cpus.reduce.js';
import * as reduceFromCanon from './30.canon.unit/canon.reduce.js';
import * as reduceFromAsset from './33.asset.unit/asset.reduce.js';
import * as reduceFromAST from './34.abstractsyntaxtree.unit/abstractsyntaxtree.reduce.js';
import * as reduceFromContinuity from './29.continuity.unit/continuity.reduce.js';

export const reducer: any = {
  conductor: reduceFromConductor.reducer,
  sqlite: reduceFromSqlite.reducer,
  ledger: reduceFromLedger.reducer,
  cuda: reduceFromCuda.reducer,
  cpus: reduceFromCpus.reducer,
  canon: reduceFromCanon.reducer,
  asset: reduceFromAsset.reducer,
  ast: reduceFromAST.reducer,
  continuity: reduceFromContinuity.reducer
};

export default class UnitData implements Model {
  idx: string = '400.conductor';
  conductor: any;
  sqlite: any;
  ledger: any;
  cuda: any;
  cpus: any;
  canon: any;
  asset: any;
  ast: any;
  continuity: any;
}
