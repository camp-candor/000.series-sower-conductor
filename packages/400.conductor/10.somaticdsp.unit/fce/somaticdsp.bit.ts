import {
  CharacterSomaticState,
  DialogueSomaticInput,
  SomaticDspReceipt,
} from './somaticdsp.interface.js';

export default interface SomaticdspBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    somaticState?: CharacterSomaticState;
    somaticInput?: DialogueSomaticInput;
    receipt?: SomaticDspReceipt;
  };
  slv?: Function;
}
