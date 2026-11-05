import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  quantizeAudioDuration,
  computeCumulativeTimeline,
} from '../37.lifecycle.unit/buz/frameQuantizer.buzz.js';
import { calculateMultiWindowDuckingCurve } from '../37.lifecycle.unit/buz/audioDucking.buzz.js';
import { validateWavFileIntegrity } from '../37.lifecycle.unit/buz/ttsClient.buzz.js';

describe('packages/400.conductor Phase 4 Acoustic Master Clock Temporal Quantization', () => {
  const scratchDir = path.resolve(process.cwd(), 'val/scratch_acoustic_test');

  beforeEach(() => {
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(scratchDir)) {
      fs.rmSync(scratchDir, { recursive: true, force: true });
    }
  });

  it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('quantizes continuous duration into exact 24.0 fps integer ceiling frames', async () => {
    // 3,125 ms = 3.125 * 24 = 75.0 -> 75 frames
    const res1 = await quantizeAudioDuration('mock.wav', 3125);
    expect(res1.targetFrames).toBe(75);
    expect(res1.sampleCount).toBe(150000); // 75 * 2000 samples

    // 3,126 ms = 75.024 -> 76 frames
    const res2 = await quantizeAudioDuration('mock.wav', 3126);
    expect(res2.targetFrames).toBe(76);
  });

  it('proves cumulative-millisecond zero-drift contiguity: End_k + 1 === Start_k+1', () => {
    // Stems: 3,420 ms, 5,180 ms, 3,800 ms, 6,000 ms
    const durations = [3420, 5180, 3800, 6000];
    const timeline = computeCumulativeTimeline(durations);

    expect(timeline.totalDurationMs).toBe(18400);
    expect(timeline.totalFrames).toBe(442); // ceil(18.4 * 24) = 442 frames

    for (let k = 0; k < timeline.shots.length - 1; k++) {
      const currentShot = timeline.shots[k];
      const nextShot = timeline.shots[k + 1];
      // Zero-Drift Invariant
      expect(currentShot.toFrame + 1).toBe(nextShot.fromFrame);
    }
  });

  it('traps zero-byte poison, undersized files (< 1KB), and corrupted RIFF headers', () => {
    const tinyFile = path.join(scratchDir, 'tiny.wav');
    fs.writeFileSync(tinyFile, Buffer.from('short data'));

    const resTiny = validateWavFileIntegrity(tinyFile);
    expect(resTiny.valid).toBe(false);
    expect(resTiny.error).toContain('ZERO_BYTE_POISON');

    const fakeHeaderFile = path.join(scratchDir, 'fake.wav');
    const fakeData = Buffer.alloc(2048, 0);
    fakeData.write('NOTR', 0); // Invalid magic bytes
    fs.writeFileSync(fakeHeaderFile, fakeData);

    const resHeader = validateWavFileIntegrity(fakeHeaderFile);
    expect(resHeader.valid).toBe(false);
    expect(resHeader.error).toContain('CORRUPT_HEADER');
  });

  it('evaluates multi-window min-reduction ducking preventing gain pumping across rapid pauses', () => {
    // Two dialogue intervals: [10, 30] and [38, 60] (pause of 7 frames < 18 frames)
    const curve = calculateMultiWindowDuckingCurve([[10, 30], [38, 60]], 100);

    // Baseline before attack
    expect(curve(0)).toBe(1.0);

    // Active speech window 1 clamped to -14 dB (0.20)
    expect(curve(15)).toBe(0.20);
    expect(curve(30)).toBe(0.20);

    // During 7-frame pause between Frame 30 and 38, gain must remain clamped without pumping back to 1.0
    expect(curve(34)).toBeLessThan(0.40);

    // Active speech window 2
    expect(curve(45)).toBe(0.20);

    // Recovery after window 2 ends at 60 (release takes 12 frames -> fully 1.0 by frame 73)
    expect(curve(60)).toBe(0.20);
    expect(curve(75)).toBe(1.0);
  });

  it('asserts 100% pure 7-bit ASCII compliance across acoustic clock modules', () => {
    const files = [
      'packages/400.conductor/37.lifecycle.unit/fce/acousticClock.interface.ts',
      'packages/400.conductor/37.lifecycle.unit/buz/ttsClient.buzz.ts',
      'packages/400.conductor/37.lifecycle.unit/buz/frameQuantizer.buzz.ts',
      'packages/400.conductor/37.lifecycle.unit/buz/audioDucking.buzz.ts',
    ];

    for (const rel of files) {
      const full = path.resolve(process.cwd(), rel);
      if (fs.existsSync(full)) {
        const content = fs.readFileSync(full, 'utf8');
        // eslint-disable-next-line no-control-regex
        const match = content.match(/[\u0080-\uFFFF]/);
        expect(match).toBeNull();
      }
    }
  });
});
