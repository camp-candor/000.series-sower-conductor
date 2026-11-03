import Frame, { ExposureSheetManifest } from './fce/frame.interface.js';

export class FrameModel implements Frame {
  idx: string = '24.frame.unit';
  deliveryFps: number = 24;
  totalScenesQuantized: number = 0;
  lastExposureSheet: ExposureSheetManifest | null = null;
}
