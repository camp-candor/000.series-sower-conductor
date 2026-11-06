import {
  RawStemDuration,
  QuantizedShot,
  TimelineQuantizationReceipt,
} from './frame.interface.js';

export default interface FrameBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    stems?: RawStemDuration[];
    singleStem?: RawStemDuration;
    wavPath?: string;
    receipt?: TimelineQuantizationReceipt;
    quantizedShot?: QuantizedShot;
  };
  slv?: Function;
}
