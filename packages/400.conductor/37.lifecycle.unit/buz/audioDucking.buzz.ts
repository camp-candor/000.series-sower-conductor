export function calculateMultiWindowDuckingCurve(
  dialogueIntervals: [number, number][] = [],
  totalFrames: number = 0
): (frame: number) => number {
  const ATTACK_FRAMES = 6;
  const RELEASE_FRAMES = 12;
  const DUCK_FLOOR = 0.20; // -14.0 dB linear gain attenuation floor

  // Pre-calculate per-frame envelope gain array
  const gainCurve = new Float32Array(Math.max(1, totalFrames)).fill(1.0);

  for (const [startFrame, endFrame] of dialogueIntervals) {
    const attackStart = Math.max(0, startFrame - ATTACK_FRAMES);
    const releaseEnd = Math.min(totalFrames - 1, endFrame + RELEASE_FRAMES);

    for (let f = attackStart; f <= releaseEnd; f++) {
      let windowGain = 1.0;

      if (f < startFrame) {
        // 6-frame quadratic attack down to floor
        const t = (f - attackStart) / ATTACK_FRAMES;
        windowGain = 1.0 - (1.0 - DUCK_FLOOR) * (t * t);
      } else if (f <= endFrame) {
        // Active dialogue speech window
        windowGain = DUCK_FLOOR;
      } else {
        // 12-frame quadratic release recovery back to 1.0
        const t = (f - endFrame) / RELEASE_FRAMES;
        windowGain = DUCK_FLOOR + (1.0 - DUCK_FLOOR) * (t * t);
      }

      // Multi-window min-reduction algorithm: clamp to lowest gain
      if (windowGain < gainCurve[f]) {
        gainCurve[f] = windowGain;
      }
    }
  }

  return (frame: number): number => {
    if (frame < 0 || frame >= totalFrames) return 1.0;
    return Math.round(gainCurve[frame] * 10000) / 10000;
  };
}
