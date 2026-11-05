export interface TtsClientOptions {
  daemonUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface SynthesizedStemReceipt {
  ok: boolean;
  wavPath: string;
  durationMs: number;
  fileSizeBytes: number;
  sampleRate: 48000;
  channels: 1 | 2;
  sha256: string;
  t0Spend: '$0.00';
  error?: string;
}

export interface QuantizedDurationResult {
  durationMs: number;
  targetFrames: number;
  sampleCount: number;
  fps: 24;
}

export interface CumulativeShotTiming {
  shotIndex: number;
  durationMs: number;
  fromFrame: number;
  toFrame: number;
  frameCount: number;
}

export interface CumulativeTimelineResult {
  totalDurationMs: number;
  totalFrames: number;
  shots: CumulativeShotTiming[];
  driftFrames: 0;
}

export interface AcousticClockReport {
  ok: boolean;
  sceneId: string;
  stems: SynthesizedStemReceipt[];
  timeline: CumulativeTimelineResult;
  duckingFloorDb: -14;
  evaluatedAtMs: number;
}
