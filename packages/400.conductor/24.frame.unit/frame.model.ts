import Frame, { TimelineQuantizationReceipt } from './fce/frame.interface.js';

export class FrameModel implements Frame {
  idx: string = '24.frame';
  totalQuantizedShots: number = 0;
  lastTimelineReceipt?: TimelineQuantizationReceipt;
}
