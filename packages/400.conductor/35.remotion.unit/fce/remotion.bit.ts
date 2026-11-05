import {
  SceneShotPlan,
  StampCompositionOptions,
  StampCompositionReceipt,
} from './remotion.interface.js';
import {
  SwangleRenderOptions,
  SwangleRenderReceipt,
  DeliverableInspectionResult,
} from './renderOptions.interface.js';

export default interface RemotionBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    sceneId?: string;
    shots?: SceneShotPlan[];
    options?: StampCompositionOptions;
    receipt?: StampCompositionReceipt;
    renderOptions?: SwangleRenderOptions;
    renderReceipt?: SwangleRenderReceipt;
    inspection?: DeliverableInspectionResult;
    [key: string]: any;
  };
  slv?: Function;
}
