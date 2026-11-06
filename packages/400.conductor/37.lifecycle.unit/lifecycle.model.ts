import Lifecycle, {
  MasterSceneStage,
  MasterSceneLifecycleContext,
} from './fce/masterLifecycle.interface.js';

export class LifecycleModel implements Lifecycle {
  idx: string = '37.lifecycle.unit';
  activeSceneId: string = 'NONE';
  stage: MasterSceneStage = 'STAGE_0_IDLE';
  lastMasterContext: MasterSceneLifecycleContext | null = null;
  lastActionTimestamp: number = 0;
}
