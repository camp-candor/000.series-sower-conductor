import { formatUnquotedLiteral } from './literalBaking.buzz.js';
import { murmurHash3 } from './kinematics.buzz.js';

export interface DialogueAudioClip {
  clipId: string;
  stemPath: string;
  fromFrame: number;
  durationInFrames: number;
  speakerId: string;
}

export interface FoleyAudioClip {
  cueName: string;
  samplePath: string;
  fromFrame: number;
  durationInFrames: number;
  volumeMultiplier: number;
}

export interface MultiTrackAudioPlan {
  sceneId: string;
  totalDurationFrames: number;
  ambientBedPath: string;
  ambientVolumeLinear: number;
  duckingFloorDb: number;
  dialogueClips: DialogueAudioClip[];
  foleyClips: FoleyAudioClip[];
}

export interface MultiWindowDuckingKeyframe {
  frame: number;
  gainLinear: number;
}

export function computeMultiWindowDuckingCurve(
  totalFrames: number,
  speechWindows: Array<{ startFrame: number; endFrame: number }>,
  duckingFloorDb = -14.0,
  attackFrames = 6,
  releaseFrames = 12
): MultiWindowDuckingKeyframe[] {
  // Merge windows that are closer than attack+release frames
  const mergedWindows: Array<{ startFrame: number; endFrame: number }> = [];

  // Sort windows just in case
  const sorted = [...speechWindows].sort((a, b) => a.startFrame - b.startFrame);

  for (const win of sorted) {
    if (mergedWindows.length === 0) {
      mergedWindows.push({ ...win });
    } else {
      const last = mergedWindows[mergedWindows.length - 1];
      if (win.startFrame - last.endFrame <= attackFrames + releaseFrames) {
        last.endFrame = Math.max(last.endFrame, win.endFrame);
      } else {
        mergedWindows.push({ ...win });
      }
    }
  }

  const curve: MultiWindowDuckingKeyframe[] = [];

  for (let f = 0; f < totalFrames; f++) {
    let minGainDb = 0.0;

    for (const win of mergedWindows) {
      let windowGainDb = 0.0;

      if (f >= win.startFrame && f <= win.endFrame) {
        windowGainDb = duckingFloorDb;
      } else if (f >= Math.max(0, win.startFrame - attackFrames) && f < win.startFrame) {
        const attackStart = Math.max(0, win.startFrame - attackFrames);
        const attackLen = win.startFrame - attackStart;
        const t = attackLen === 0 ? 1.0 : (f - attackStart) / attackLen;
        windowGainDb = duckingFloorDb * Math.pow(t, 2);
      } else if (f > win.endFrame && f <= win.endFrame + releaseFrames) {
        const t = 1.0 - (f - win.endFrame) / releaseFrames;
        windowGainDb = duckingFloorDb * Math.pow(t, 2);
      }

      minGainDb = Math.min(minGainDb, windowGainDb);
    }

    const gainLinear = Number(Math.pow(10, minGainDb / 20).toFixed(4));
    curve.push({ frame: f, gainLinear });
  }

  return curve;
}

export function generateMultiTrackAudioJsx(plan: MultiTrackAudioPlan): string {
  const speechWindows = plan.dialogueClips.map((c) => ({
    startFrame: c.fromFrame,
    endFrame: c.fromFrame + c.durationInFrames - 1,
  }));

  const duckingCurve = computeMultiWindowDuckingCurve(
    plan.totalDurationFrames,
    speechWindows,
    plan.duckingFloorDb,
    6,
    12
  );

  const serializedGainCurve = JSON.stringify(duckingCurve.map((k) => k.gainLinear));

  const dialogueSequences = plan.dialogueClips
    .map((c) => {
      const from = formatUnquotedLiteral(c.fromFrame);
      const dur = formatUnquotedLiteral(c.durationInFrames);
      return `      {/* Track 1: Spoken Dialogue (${c.speakerId}) */}
      <Sequence from={${from}} durationInFrames={${dur}}>
        <Audio src={staticFile(${JSON.stringify(c.stemPath)})} volume={1.0} />
      </Sequence>`;
    })
    .join('\n');

  const foleySequences = plan.foleyClips
    .map((f) => {
      const from = formatUnquotedLiteral(f.fromFrame);
      const dur = formatUnquotedLiteral(f.durationInFrames);
      const vol = formatUnquotedLiteral(f.volumeMultiplier);
      const seed = murmurHash3(`${plan.sceneId}:${f.cueName}:${f.fromFrame}`);
      return `      {/* Track 2: Punctual Foley Transient [Seed: ${seed}] */}
      <Sequence from={${from}} durationInFrames={${dur}}>
        <Audio src={staticFile(${JSON.stringify(f.samplePath)})} volume={${vol}} />
      </Sequence>`;
    })
    .join('\n');

  return `
// Multi-Track Acoustic Synchronization Engine (Master Clock Architecture)
export const MultiTrackAudioRig_${plan.sceneId}: React.FC = () => {
  const frame = useCurrentFrame();
  const duckingLut: number[] = ${serializedGainCurve};
  const activeGain = duckingLut[frame] ?? 1.0;
  const baseAmbientVolume = ${formatUnquotedLiteral(plan.ambientVolumeLinear)};

  return (
    <>
${dialogueSequences}

${foleySequences}

      {/* Track 3: Ambient Bed & Score (Continuous with Min-Reduction Sidechain Ducking) */}
      <Audio
        src={staticFile(${JSON.stringify(plan.ambientBedPath)})}
        volume={baseAmbientVolume * activeGain}
      />
    </>
  );
};
  `.trim();
}
