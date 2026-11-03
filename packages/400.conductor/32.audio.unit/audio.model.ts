import Audio, { AcousticPacingManifest } from './fce/audio.interface.js';

export class AudioModel implements Audio {
  idx: string = '32.audio.unit';
  defaultDuckingFloorDb: number = -14.0;
  totalEnvelopesGenerated: number = 0;
  lastPacingManifest: AcousticPacingManifest | null = null;
}
