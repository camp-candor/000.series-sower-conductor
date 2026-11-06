// packages/400.conductor/32.audio.unit/fce/audio.bit.ts
import {
  ExposureSheetDocument,
  ExposureSheetReceipt,
  DialogueWindow,
  FoleyCueItem,
} from './audio.interface.js';

export default interface AudioBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    scene_id?: string;
    series_id?: string;
    ambient_loop_path?: string;
    dialogue_windows?: DialogueWindow[];
    foley_cues?: FoleyCueItem[];
    exposureSheet?: ExposureSheetDocument;
    receipt?: ExposureSheetReceipt;
  };
  slv?: Function;
}
