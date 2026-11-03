import ConductorUnit from './00.conductor.unit/conductor.unit.js';
import CudaUnit from './27.cuda.unit/cuda.unit.js';
import CpusUnit from './28.cpus.unit/cpus.unit.js';
import { Model } from './99.core/interface/model.interface.js';

export const list: Array<any> = [
  ConductorUnit,
  CudaUnit,
  CpusUnit
];

import * as reduceFromConductor from './00.conductor.unit/conductor.reduce.js';
import * as reduceFromCuda from './27.cuda.unit/cuda.reduce.js';
import * as reduceFromCpus from './28.cpus.unit/cpus.reduce.js';

export const reducer: any = {
  conductor: reduceFromConductor.reducer,
  cuda: reduceFromCuda.reducer,
  cpus: reduceFromCpus.reducer
};

export default class UnitData implements Model {
  idx: string = '400.conductor';
  conductor: any;
  cuda: any;
  cpus: any;
}
