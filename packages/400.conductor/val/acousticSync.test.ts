import { describe, it, expect } from 'vitest';
import {
  computeMultiWindowDuckingCurve,
  generateMultiTrackAudioJsx,
  MultiTrackAudioPlan,
} from '../35.remotion.unit/buz/acousticDucking.buzz.js';
import { synthesizeStaticCompositionTsx } from '../35.remotion.unit/buz/remotion.buzz.js';
import { computeCumulativeShotTimings } from '../35.remotion.unit/buz/literalBaking.buzz.js';

describe('packages/400.conductor 35.remotion.unit Acoustic Multi-Track Synchronization Engine', () => {
  it('computes anti-pumping min-reduction curve across rapid speech intervals without surging', () => {
    // Two speech windows separated by only 8 frames (frames 20 to 28)
    // Attack = 6 frames, Release = 12 frames.
    // In naive systems, gain would aggressively pump up between 20 and 28.
    const speechWindows = [
      { startFrame: 5, endFrame: 20 },
      { startFrame: 28, endFrame: 45 },
    ];

    const duckingCurve = computeMultiWindowDuckingCurve(60, speechWindows, -14.0, 6, 12);
    expect(duckingCurve.length).toBe(60);

    // Frame 0: Baseline unattenuated
    expect(duckingCurve[0].gainLinear).toBe(1.0);

    // Frame 10: Active speech window 1 -> ducked to -14dB (approx 0.1995)
    expect(duckingCurve[10].gainLinear).toBeCloseTo(0.1995, 2);

    // Frame 24: Midway between window 1 and window 2 (gap of 8 frames < 18 frames release/attack)
    // Gain MUST remain held down; it must NOT surge above 0.50
    expect(duckingCurve[24].gainLinear).toBeLessThan(0.35);

    // Frame 35: Active speech window 2 -> fully ducked
    expect(duckingCurve[35].gainLinear).toBeCloseTo(0.1995, 2);

    // Frame 59: After full 12-frame release recovery -> returned to 1.0
    expect(duckingCurve[59].gainLinear).toBe(1.0);
  });

  it('generates declarative multi-track audio JSX containing Track 1, 2, and 3 elements', () => {
    const plan: MultiTrackAudioPlan = {
      sceneId: 'sc01',
      totalDurationFrames: 120,
      ambientBedPath: 'audio/ambiance/swamp_night.wav',
      ambientVolumeLinear: 0.40,
      duckingFloorDb: -14.0,
      dialogueClips: [
        {
          clipId: 'd1',
          stemPath: 'audio/dialogue/sh01.wav',
          fromFrame: 0,
          durationInFrames: 50,
          speakerId: 'char_elias',
        },
      ],
      foleyClips: [
        {
          cueName: 'footstep_mud',
          samplePath: 'audio/foley/footstep_01.wav',
          fromFrame: 15,
          durationInFrames: 24,
          volumeMultiplier: 0.85,
        },
      ],
    };

    const jsx = generateMultiTrackAudioJsx(plan);

    // Track 1 checks
    expect(jsx).toContain('Track 1: Spoken Dialogue (char_elias)');
    expect(jsx).toContain('<Sequence from={0} durationInFrames={50}>');
    expect(jsx).toContain('src={staticFile("audio/dialogue/sh01.wav")}');

    // Track 2 checks
    expect(jsx).toContain('Track 2: Punctual Foley Transient');
    expect(jsx).toContain('<Sequence from={15} durationInFrames={24}>');
    expect(jsx).toContain('volume={0.85}');

    // Track 3 checks
    expect(jsx).toContain('Track 3: Ambient Bed & Score');
    expect(jsx).toContain('volume={baseAmbientVolume * activeGain}');
  });

  it('integrates multi-track audio rig into synthesized master composition TSX', () => {
    const rawShots = [
      {
        shotId: 'sh01',
        characterId: 'char_elias',
        dialogueText: 'Stay quiet.',
        platePath: 'takes/elias.mp4',
        backgroundPath: 'backgrounds/swamp.png',
        durationMs: 2000, // 48 frames
      },
    ];

    const timed = computeCumulativeShotTimings(rawShots);
    const code = synthesizeStaticCompositionTsx('ep01_sc01', 48, timed);

    expect(code).toContain('import { Composition, Sequence, OffthreadVideo, Img, Audio, staticFile');
    expect(code).toContain('export const MultiTrackAudioRig_ep01_sc01: React.FC = () => {');
    expect(code).toContain('<MultiTrackAudioRig_ep01_sc01 />');
  });
});
