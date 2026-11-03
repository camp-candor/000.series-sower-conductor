import { Model } from './99.core/interface/model.interface.js';

import ConductorUnit from './00.conductor.unit/conductor.unit.js';
import ModelUnit from './96.model.unit/model.unit.js';
import CollectUnit from './97.collect.unit/collect.unit.js';
import MenuUnit from './98.menu.unit/menu.unit.js';
import BusUnit from './99.bus.unit/bus.unit.js';
import CudaUnit from './27.cuda.unit/cuda.unit.js';
import CpusUnit from './28.cpus.unit/cpus.unit.js';

import Conductor from './00.conductor.unit/fce/conductor.interface.js';
import { ConductorModel } from './00.conductor.unit/conductor.model.js';
import ModelInterface from './96.model.unit/fce/model.interface.js';
import { ModelModel } from './96.model.unit/model.model.js';
import Collect from './97.collect.unit/fce/collect.interface.js';
import { CollectModel } from './97.collect.unit/collect.model.js';
import Menu from './98.menu.unit/fce/menu.interface.js';
import { MenuModel } from './98.menu.unit/menu.model.js';
import Bus from './99.bus.unit/fce/bus.interface.js';
import { BusModel } from './99.bus.unit/bus.model.js';

export const list: Array<any> = [
  ConductorUnit,
  ModelUnit,
  CollectUnit,
  MenuUnit,
  BusUnit,
  CudaUnit,
  CpusUnit
];

import * as reduceFromConductor from './00.conductor.unit/conductor.reduce.js';
import * as reduceFromModel from './96.model.unit/model.reduce.js';
import * as reduceFromCollect from './97.collect.unit/collect.reduce.js';
import * as reduceFromMenu from './98.menu.unit/menu.reduce.js';
import * as reduceFromBus from './99.bus.unit/bus.reduce.js';
import * as reduceFromCuda from './27.cuda.unit/cuda.reduce.js';
import * as reduceFromCpus from './28.cpus.unit/cpus.reduce.js';

export const reducer: any = {
  conductor: reduceFromConductor.reducer,
  model: reduceFromModel.reducer,
  collect: reduceFromCollect.reducer,
  menu: reduceFromMenu.reducer,
  bus: reduceFromBus.reducer,
  cuda: reduceFromCuda.reducer,
  cpus: reduceFromCpus.reducer
};

export default class UnitData implements Model {
  idx: string = '400.conductor';
  conductor: Conductor = new ConductorModel();
  model: ModelInterface = new ModelModel();
  collect: Collect = new CollectModel();
  menu: Menu = new MenuModel();
  bus: Bus = new BusModel();
  cuda: any;
  cpus: any;
}
