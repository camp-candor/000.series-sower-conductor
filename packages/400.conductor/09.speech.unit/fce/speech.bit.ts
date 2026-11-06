import {
  SpeechGenerationRequest,
  SceneSpeechReceipt,
  DialogueSynthesisItem,
  StemSynthesisReceipt,
} from './speech.interface.js';

export default interface SpeechBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    request?: SpeechGenerationRequest;
    singleItem?: DialogueSynthesisItem;
    receipt?: SceneSpeechReceipt;
    stemReceipt?: StemSynthesisReceipt;
  };
  slv?: Function;
}
