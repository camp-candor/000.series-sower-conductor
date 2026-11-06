import { describe, it, expect, beforeEach } from 'vitest';
import { FrameModel } from '../24.frame.unit/frame.model.js';
import * as Buzz from '../24.frame.unit/buz/frame.buzz.js';
import { RawStemDuration } from '../24.frame.unit/fce/frame.interface.js';

describe('24.frame.unit: Discrete Frame Temporal Quantization & Causal Alignment', () => {
  let model: FrameModel;

  beforeEach(() => {
    model = new FrameModel();
  });

  it('calculates causal 4n+1 VAE allocations correctly and enforces non-negative slack', () => {
    const cases = [
      { frames: 1, expectedAlloc: 1, expectedSlack: 0, n: 0 },
      { frames: 2, expectedAlloc: 5, expectedSlack: 3, n: 1 },
      { frames: 37, expectedAlloc: 37, expectedSlack: 0, n: 9 },
      { frames: 38, expectedAlloc: 41, expectedSlack: 3, n: 10 },
      { frames: 75, expectedAlloc: 77, expectedSlack: 2, n: 19 },
    ];

    for (const c of cases) {
      const res = Buzz.calculateCausalVaeAllocation(c.frames);
      expect(res.conformed_frames).toBe(c.expectedAlloc);
      expect(res.padding_slack_frames).toBe(c.expectedSlack);
      expect(res.n_stride).toBe(c.n);
      expect((res.conformed_frames - 1) % 4).toBe(0);
    }
  });

  it('guarantees cumulative-millisecond zero-drift contiguity across consecutive cuts', () => {
    const shots: RawStemDuration[] = [
      { shot_id: 'sh01', duration_ms: 3120 },
      { shot_id: 'sh02', duration_ms: 1840 },
      { shot_id: 'sh03', duration_ms: 2400 },
    ];

    const timeline = Buzz.quantizeShotTimeline(shots);
    expect(timeline.ok).toBe(true);
    expect(timeline.is_contiguous).toBe(true);

    for (let i = 0; i < timeline.shots.length - 1; i++) {
      expect(timeline.shots[i].to_frame + 1).toBe(timeline.shots[i + 1].from_frame);
    }

    expect(timeline.drift_ms).toBeLessThan(41.67);
  });

  it('clamps sub-frame durations (< 41.67ms) to minimum 1 frame budget', () => {
    const shots: RawStemDuration[] = [{ shot_id: 'sh_gasp', duration_ms: 15 }];
    const timeline = Buzz.quantizeShotTimeline(shots);

    expect(timeline.shots[0].target_frames).toBe(1);
    expect(timeline.shots[0].from_frame).toBe(0);
    expect(timeline.shots[0].to_frame).toBe(0);
  });

  it('preserves the 2,000-sample constant ratio across frame boundaries', () => {
    const shots: RawStemDuration[] = [{ shot_id: 'sh01', duration_ms: 1000 }];
    const timeline = Buzz.quantizeShotTimeline(shots);
    const shot = timeline.shots[0];

    expect(shot.target_frames).toBe(24);
    expect(shot.sample_offset_start).toBe(0);
    expect(shot.sample_offset_end).toBe(24 * Buzz.SAMPLES_PER_FRAME);
  });
});

