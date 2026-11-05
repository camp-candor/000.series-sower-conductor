import RemotionState from './fce/remotion.interface.js';
import { SwangleRenderReceipt } from './fce/renderOptions.interface.js';

export class RemotionModel implements RemotionState {
  idx: string = '35.remotion.unit';
  status: string = 'IDLE';
  lastStampedSceneId: string | null = null;
  lastStampedFilePath: string | null = null;
  lastChecksumSha256: string | null = null;
  lastRenderReceipt: SwangleRenderReceipt | null = null;
  lastActionTimestamp: number = 0;
}
