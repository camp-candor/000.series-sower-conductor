import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  QuantizedDurationResult,
  CumulativeTimelineResult,
  CumulativeShotTiming,
} from '../fce/acousticClock.interface.js';

const execFileAsync = promisify(execFile);

export async function quantizeAudioDuration(
  wavFilePath: string,
  mockDurationMs?: number
): Promise<QuantizedDurationResult> {
  let durationMs: number = mockDurationMs || 0;

  if (mockDurationMs === undefined) {
    const resolvedPath = path.resolve(process.cwd(), wavFilePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`FILE_NOT_FOUND: Audio stem missing on disk: ${wavFilePath}`);
    }

    try {
      const { stdout } = await execFileAsync('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'json',
        resolvedPath,
      ]);
      const data = JSON.parse(stdout);
      const durationSec = parseFloat(data.format?.duration || '0');
      durationMs = Math.round(durationSec * 1000);
    } catch {
      // Graceful fallback to byte-rate probing for 48kHz 16-bit mono PCM: (size - 44) / 96
      const stats = fs.statSync(resolvedPath);
      const pcmBytes = Math.max(0, stats.size - 44);
      durationMs = Math.round((pcmBytes / 96000) * 1000);
    }
  }

  // Discrete 24.0 fps integer ceiling math
  const targetFrames = Math.ceil((durationMs / 1000) * 24.0);
  const sampleCount = targetFrames * 2000; // 2,000 samples per frame constant (48000 / 24)

  return {
    durationMs,
    targetFrames,
    sampleCount,
    fps: 24,
  };
}

export function computeCumulativeTimeline(
  stemDurationsMs: number[] = []
): CumulativeTimelineResult {
  const shots: CumulativeShotTiming[] = [];
  let accumulatedMs = 0;

  for (let i = 0; i < stemDurationsMs.length; i++) {
    const dMs = stemDurationsMs[i];
    const prevAccumulatedMs = accumulatedMs;
    accumulatedMs += dMs;

    // Cumulative-millisecond single-quantization formula
    const fromFrame = Math.ceil((prevAccumulatedMs / 1000) * 24.0);
    const toFrame = Math.ceil((accumulatedMs / 1000) * 24.0) - 1;
    const frameCount = toFrame - fromFrame + 1;

    shots.push({
      shotIndex: i + 1,
      durationMs: dMs,
      fromFrame,
      toFrame,
      frameCount,
    });
  }

  const totalFrames = shots.length > 0 ? shots[shots.length - 1].toFrame + 1 : 0;

  return {
    totalDurationMs: accumulatedMs,
    totalFrames,
    shots,
    driftFrames: 0,
  };
}
