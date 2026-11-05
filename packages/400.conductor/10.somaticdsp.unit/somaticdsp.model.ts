import Somaticdsp, {
  CharacterSomaticState,
  SomaticDspReceipt,
} from './fce/somaticdsp.interface.js';

export class SomaticdspModel implements Somaticdsp {
  idx: string = '10.somaticdsp';
  characterProfiles: Record<string, CharacterSomaticState> = {};
  lastReceipt?: SomaticDspReceipt;
}
