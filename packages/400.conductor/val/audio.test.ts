import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sim from '../hunt.js';
import * as ActAudio from '../32.audio.unit/audio.action.js';
import {
  murmurHash3,
  computeQuadraticDuckingCurve,
} from '../32.audio.unit/buz/audio.buzz.js';

describe('packages/400.conductor 32.audio.unit Acoustic Ducking & Exposure Sheet', () => {
  const testOutputDir = path.resolve(process.cwd(), 'drafts/test_output');
  const testSheetPath = path.resolve(testOutputDir, 'test_exposure_sheet.json');

  afterEach(() => {
    if (fs.existsSync(testSheetPath)) fs.unlinkSync(testSheetPath);
    if (fs.existsSync(testOutputDir)) fs.rmdirSync(testOutputDir);
  });

  it('generates deterministic MurmurHash3 seeds across repeated invocations', () => {
    const seed1 = murmurHash3('ep01:sh01:mud_boot_squelch');
    const seed2 = murmurHash3('ep01:sh01:mud_boot_squelch');
    const seedDifferent = murmurHash3('ep01:sh01:metal_pipe_hit');

    expect(seed1).toBe(seed2);
    expect(typeof seed1).toBe('number');
    expect(seed1).not.toBe(seedDifferent);
  });

  it('computes -14 dB quadratic ducking curve with 6-frame attack and 12-frame release', () => {
    const totalFrames = 30;
    const speechWindows = [{ startFrame: 10, endFrame: 20 }];

    const curve = computeQuadraticDuckingCurve(totalFrames, speechWindows, -14.0, 6, 12);
    expect(curve.length).toBe(30);

    // Resting baseline before attack: 0 dB (gain = 1.0)
    expect(curve[0].gainDb).toBe(0.0);
    expect(curve[0].interpolatedGainLinear).toBe(1.0);

    // Active speech window: fully ducked to -14 dB (gain approx 0.1995)
    expect(curve[10].gainDb).toBe(-14.0);
    expect(curve[15].gainDb).toBe(-14.0);
    expect(curve[20].gainDb).toBe(-14.0);
    expect(curve[15].interpolatedGainLinear).toBeCloseTo(0.20, 2);

    // Attack window (frame 7: midway between 4 and 10)
    expect(curve[7].gainDb).toBeLessThan(0.0);
    expect(curve[7].gainDb).toBeGreaterThan(-14.0);

    // Release window (frame 26: midway between 20 and 32)
    expect(curve[26].gainDb).toBeLessThan(0.0);
    expect(curve[26].gainDb).toBeGreaterThan(-14.0);
  });

  it('dispatches WRITE_EXPOSURE_SHEET via sim.hunt and commits atomic .tmp file swap', async () => {
    const mockPayload = {
      sceneId: 'ep01_sc01',
      deliveryFps: 24,
      totalFrames: 120,
    };

    const res = await sim.hunt!(ActAudio.WRITE_EXPOSURE_SHEET, {
      src: testSheetPath,
      dat: { manifest: mockPayload },
    });

    expect(res).toBeDefined();
    expect(res.audioBit.val).toBe(1);
    expect(fs.existsSync(testSheetPath)).toBe(true);
    expect(fs.existsSync(`${testSheetPath}.tmp`)).toBe(false);

    const written = JSON.parse(fs.readFileSync(testSheetPath, 'utf8'));
    expect(written.sceneId).toBe('ep01_sc01');
  });
});
