import ConductorUnit from './00.conductor.unit/conductor.unit.js'
import LogisticUnit from './04.logistic.unit/logistic.unit.js'
import TypesUnit from './07.types.unit/types.unit.js'
import SqliteUnit from './08.sqlite.unit/sqlite.unit.js'
import SpeechUnit from './09.speech.unit/speech.unit.js'
import Speech from './09.speech.unit/fce/speech.interface.js'
import { SpeechModel } from './09.speech.unit/speech.model.js'

import SomaticdspUnit from './10.somaticdsp.unit/somaticdsp.unit.js'
import TelemetryUnit from './11.telemetry.unit/telemetry.unit.js'
import SceneUnit from './12.scene.unit/scene.unit.js'
import ReceiptUnit from './13.receipt.unit/receipt.unit.js'
import ReactionUnit from './14.reaction.unit/reaction.unit.js'
import PropsUnit from './15.props.unit/props.unit.js'
import PipelineUnit from './16.pipeline.unit/pipeline.unit.js'
import NarrativeUnit from './17.narrative.unit/narrative.unit.js'
import MemoryUnit from './18.memory.unit/memory.unit.js'
import LogisticsUnit from './19.logistics.unit/logistics.unit.js'
import LifecycleUnit from './20.lifecycle.unit/lifecycle.unit.js'
import LedgerUnit from './21.ledger.unit/ledger.unit.js'
import HealthUnit from './22.health.unit/health.unit.js'
import GrievanceUnit from './23.grievance.unit/grievance.unit.js'
import FrameUnit from './24.frame.unit/frame.unit.js'
import Frame from './24.frame.unit/fce/frame.interface.js'
import { FrameModel } from './24.frame.unit/frame.model.js'
import DialogueUnit from './25.dialogue.unit/dialogue.unit.js'
import EpisodeUnit from './25.episode.unit/episode.unit.js'
import VramUnit from './26.vram.unit/vram.unit.js'
import CudaUnit from './27.cuda.unit/cuda.unit.js'
import CpusUnit from './28.cpus.unit/cpus.unit.js'
import ContinuityUnit from './29.continuity.unit/continuity.unit.js'
import CanonUnit from './30.canon.unit/canon.unit.js'
import CameraUnit from './31.camera.unit/camera.unit.js'
import AudioUnit from './32.audio.unit/audio.unit.js'
import Audio from './32.audio.unit/fce/audio.interface.js'
import { AudioModel } from './32.audio.unit/audio.model.js'
import AssetUnit from './33.asset.unit/asset.unit.js'
import AbstractsyntaxtreeUnit from './34.abstractsyntaxtree.unit/abstractsyntaxtree.unit.js'
import RemotionUnit from './35.remotion.unit/remotion.unit.js'
import EdgebridgeUnit from './36.edgebridge.unit/edgebridge.unit.js'
import MasterLifecycleUnit from './37.lifecycle.unit/lifecycle.unit.js'
import ModelUnit from './96.model.unit/model.unit.js'
import CollectUnit from './97.collect.unit/collect.unit.js'
import MenuUnit from './98.menu.unit/menu.unit.js'
import BusUnit from './99.bus.unit/bus.unit.js'
import { RemotionModel } from './35.remotion.unit/remotion.model.js'
import { EdgeBridgeModel } from './36.edgebridge.unit/edgebridge.model.js'
import { LifecycleModel } from './37.lifecycle.unit/lifecycle.model.js'
import { Model } from './99.core/interface/model.interface.js'

export const list: Array<any> = [
    ConductorUnit,
    LogisticUnit,
    TypesUnit,
    SqliteUnit,
    SpeechUnit,
    SomaticdspUnit,
    TelemetryUnit,
    SceneUnit,
    ReceiptUnit,
    ReactionUnit,
    PropsUnit,
    PipelineUnit,
    NarrativeUnit,
    MemoryUnit,
    LogisticsUnit,
    LifecycleUnit,
    LedgerUnit,
    HealthUnit,
    GrievanceUnit,
    FrameUnit,
    DialogueUnit,
    EpisodeUnit,
    VramUnit,
    CudaUnit,
    CpusUnit,
    ContinuityUnit,
    CanonUnit,
    CameraUnit,
    AudioUnit,
    AssetUnit,
    AbstractsyntaxtreeUnit,
    RemotionUnit,
    EdgebridgeUnit,
    MasterLifecycleUnit,
    ModelUnit,
    CollectUnit,
    MenuUnit,
    BusUnit,
]

import * as reduceFromConductor from './00.conductor.unit/conductor.reduce.js'
import * as reduceFromLogistic from './04.logistic.unit/logistic.reduce.js'
import * as reduceFromTypes from './07.types.unit/types.reduce.js'
import * as reduceFromSqlite from './08.sqlite.unit/sqlite.reduce.js'
import * as reduceFromSpeech from './09.speech.unit/speech.reduce.js'
import * as reduceFromSomaticdsp from './10.somaticdsp.unit/somaticdsp.reduce.js'
import * as reduceFromTelemetry from './11.telemetry.unit/telemetry.reduce.js'
import * as reduceFromScene from './12.scene.unit/scene.reduce.js'
import * as reduceFromReceipt from './13.receipt.unit/receipt.reduce.js'
import * as reduceFromReaction from './14.reaction.unit/reaction.reduce.js'
import * as reduceFromProps from './15.props.unit/props.reduce.js'
import * as reduceFromPipeline from './16.pipeline.unit/pipeline.reduce.js'
import * as reduceFromNarrative from './17.narrative.unit/narrative.reduce.js'
import * as reduceFromMemory from './18.memory.unit/memory.reduce.js'
import * as reduceFromLogistics from './19.logistics.unit/logistics.reduce.js'
import * as reduceFromLifecycle from './20.lifecycle.unit/lifecycle.reduce.js'
import * as reduceFromLedger from './21.ledger.unit/ledger.reduce.js'
import * as reduceFromHealth from './22.health.unit/health.reduce.js'
import * as reduceFromGrievance from './23.grievance.unit/grievance.reduce.js'
import * as reduceFromFrame from './24.frame.unit/frame.reduce.js'
import * as reduceFromDialogue from './25.dialogue.unit/dialogue.reduce.js'
import * as reduceFromEpisode from './25.episode.unit/episode.reduce.js'
import * as reduceFromVram from './26.vram.unit/vram.reduce.js'
import * as reduceFromCuda from './27.cuda.unit/cuda.reduce.js'
import * as reduceFromCpus from './28.cpus.unit/cpus.reduce.js'
import * as reduceFromContinuity from './29.continuity.unit/continuity.reduce.js'
import * as reduceFromCanon from './30.canon.unit/canon.reduce.js'
import * as reduceFromCamera from './31.camera.unit/camera.reduce.js'
import * as reduceFromAudio from './32.audio.unit/audio.reduce.js'
import * as reduceFromAsset from './33.asset.unit/asset.reduce.js'
import * as reduceFromAbstractsyntaxtree from './34.abstractsyntaxtree.unit/abstractsyntaxtree.reduce.js'
import * as reduceFromRemotion from './35.remotion.unit/remotion.reduce.js'
import * as reduceFromEdgebridge from './36.edgebridge.unit/edgebridge.reduce.js'
import * as reduceFromMasterLifecycle from './37.lifecycle.unit/lifecycle.reduce.js'
import * as reduceFromModel from './96.model.unit/model.reduce.js'
import * as reduceFromCollect from './97.collect.unit/collect.reduce.js'
import * as reduceFromMenu from './98.menu.unit/menu.reduce.js'
import * as reduceFromBus from './99.bus.unit/bus.reduce.js'

export const reducer: any = {
    conductor: reduceFromConductor.reducer,
    logistic: reduceFromLogistic.reducer,
    types: reduceFromTypes.reducer,
    sqlite: reduceFromSqlite.reducer,
    speech: reduceFromSpeech.reducer,
    somaticdsp: reduceFromSomaticdsp.reducer,
    telemetry: reduceFromTelemetry.reducer,
    scene: reduceFromScene.reducer,
    receipt: reduceFromReceipt.reducer,
    reaction: reduceFromReaction.reducer,
    props: reduceFromProps.reducer,
    pipeline: reduceFromPipeline.reducer,
    narrative: reduceFromNarrative.reducer,
    memory: reduceFromMemory.reducer,
    logistics: reduceFromLogistics.reducer,
    lifecycle: reduceFromMasterLifecycle.reducer,
    ledger: reduceFromLedger.reducer,
    health: reduceFromHealth.reducer,
    grievance: reduceFromGrievance.reducer,
    frame: reduceFromFrame.reducer,
    dialogue: reduceFromDialogue.reducer,
    episode: reduceFromEpisode.reducer,
    vram: reduceFromVram.reducer,
    cuda: reduceFromCuda.reducer,
    cpus: reduceFromCpus.reducer,
    continuity: reduceFromContinuity.reducer,
    canon: reduceFromCanon.reducer,
    camera: reduceFromCamera.reducer,
    audio: reduceFromAudio.reducer,
    asset: reduceFromAsset.reducer,
    ast: reduceFromAbstractsyntaxtree.reducer,
    abstractsyntaxtree: reduceFromAbstractsyntaxtree.reducer,
    remotion: reduceFromRemotion.reducer,
    edgebridge: reduceFromEdgebridge.reducer,
    unitLifecycle: reduceFromLifecycle.reducer,
    masterLifecycle: reduceFromMasterLifecycle.reducer,
    model: reduceFromModel.reducer,
    collect: reduceFromCollect.reducer,
    menu: reduceFromMenu.reducer,
    bus: reduceFromBus.reducer,
}

// prettier-ignore
export default class UnitData implements Model {
  idx: string = '400.conductor';
  conductor: any;
  logistic: any;
  types: any;
  sqlite: any;
  speech: Speech = new SpeechModel();
  somaticdsp: any;
  telemetry: any;
  scene: any;
  receipt: any;
  reaction: any;
  props: any;
  pipeline: any;
  narrative: any;
  memory: any;
  logistics: any;
  lifecycle: any = new LifecycleModel();
  ledger: any;
  health: any;
  grievance: any;
  frame: Frame = new FrameModel();
  dialogue: any;
  episode: any;
  vram: any;
  cuda: any;
  cpus: any;
  continuity: any;
  canon: any;
  camera: any;
  audio: Audio = new AudioModel();
  asset: any;
  ast: any;
  abstractsyntaxtree: any;
  remotion: any = new RemotionModel();
  edgebridge: any = new EdgeBridgeModel();
  unitLifecycle: any;
  masterLifecycle: any;
  model: any;
  collect: any;
  menu: any;
  bus: any;
}
