import Somaticdsp, { TTSGenerationPayload } from './fce/somaticdsp.interface.js';

export class SomaticdspModel implements Somaticdsp {
  idx: string = '10.somaticdsp.unit';
  totalTranslationsExecuted: number = 0;
  lastTranslatedPayload: TTSGenerationPayload | null = null;
}
