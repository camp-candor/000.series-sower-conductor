import { FrameModel } from '../frame.model.js';
import type FrameBit from '../fce/frame.bit.js';
import type { StemProbeRequest, StemProbeResult } from '../fce/frame.interface.js';
import type State from '../../99.core/state.js';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

export const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export const MIN_VALID_WAV_BYTES = 1024;
export const SAMPLES_PER_SECOND = 48000;

export const executeFfprobe = async (wavPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    execFile(
      'ffprobe',
      [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        wavPath,
      ],
      { timeout: 5000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`FFPROBE_EXEC_FAILED: ${err.message} (${stderr.trim()})`));
          return;
        }
        const rawSec = parseFloat(stdout.trim());
        if (isNaN(rawSec) || rawSec <= 0) {
          reject(new Error(`FFPROBE_PARSE_FAILED: Invalid duration output: ${stdout.trim()}`));
          return;
        }
        resolve(Math.round(rawSec * 1000));
      },
    );
  });
};

export const probeStemDuration = async (
  cpy: FrameModel,
  bal: FrameBit,
  ste?: State,
): Promise<FrameModel> => {
  const req = bal.dat?.probeRequest;
  const mockDuration = bal.dat?.mockDurationMs ?? req?.mock_duration_ms;

  const emit = async (msg: string) => {
    if (ste && typeof ste.hunt === 'function') {
      await ste.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: msg,
      }).catch(() => {});
    }
  };

  if (!req || !req.wav_path) {
    const errorMsg = 'PROBE_ERROR: Missing probeRequest or wav_path';
    await emit(`:: [PROBE:FAIL] ${errorMsg}`);
    if (bal.slv) {
      bal.slv({
        frmBit: {
          idx: 'probe-stem-duration-fail',
          val: -1,
          dat: {
            probeResult: {
              ok: false,
              shot_id: req?.shot_id || 'UNKNOWN',
              wav_path: req?.wav_path || '',
              duration_ms: 0,
              sample_count: 0,
              file_size_bytes: 0,
              sha256: '',
              audio_spec: {
                sample_rate_hz: 48000,
                bit_depth: 24,
                channels: 1,
                codec: 'pcm_s24le',
              },
              error: errorMsg,
            },
          },
        },
      });
    }
    return cpy;
  }

  const wavPath = req.wav_path;
  const shotId = req.shot_id;

  try {
    if (!fs.existsSync(wavPath) && mockDuration === undefined) {
      throw new Error(`FILE_NOT_FOUND: Audio stem does not exist at path: ${wavPath}`);
    }

    let fileBytes = 0;
    let sha256 = '';

    if (fs.existsSync(wavPath)) {
      const stats = fs.statSync(wavPath);
      fileBytes = stats.size;

      const buffer = fs.readFileSync(wavPath);
      sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

      if (fileBytes <= MIN_VALID_WAV_BYTES || sha256 === EMPTY_SHA256) {
        throw new Error(`ZERO_BYTE_POISON: Stem is corrupt or zero-byte (size=${fileBytes} bytes, hash=${sha256})`);
      }
    } else {
      fileBytes = 48000 * 3 * 2; // 2 seconds of 48k/24b linear PCM mock
      sha256 = 'mock_verified_pcm_s24le_sha256';
    }

    const durationMs = mockDuration !== undefined ? mockDuration : await executeFfprobe(wavPath);
    const sampleCount = Math.round((durationMs / 1000) * SAMPLES_PER_SECOND);

    const probeResult: StemProbeResult = {
      ok: true,
      shot_id: shotId,
      wav_path: wavPath,
      duration_ms: durationMs,
      sample_count: sampleCount,
      file_size_bytes: fileBytes,
      sha256,
      audio_spec: {
        sample_rate_hz: 48000,
        bit_depth: 24,
        channels: 1,
        codec: 'pcm_s24le',
      },
    };

    await emit(`>> [PROBE:OK] [${shotId}]: ${durationMs}ms (${sampleCount} samples, ${fileBytes} bytes)`);

    if (bal.slv) {
      bal.slv({
        frmBit: {
          idx: 'probe-stem-duration-success',
          val: durationMs,
          dat: { probeResult },
        },
      });
    }
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await emit(`:: [PROBE:FAIL] [${shotId}]: ${errorMsg}`);

    if (bal.slv) {
      bal.slv({
        frmBit: {
          idx: 'probe-stem-duration-fail',
          val: -1,
          dat: {
            probeResult: {
              ok: false,
              shot_id: shotId,
              wav_path: wavPath,
              duration_ms: 0,
              sample_count: 0,
              file_size_bytes: 0,
              sha256: '',
              audio_spec: {
                sample_rate_hz: 48000,
                bit_depth: 24,
                channels: 1,
                codec: 'pcm_s24le',
              },
              error: errorMsg,
            },
          },
        },
      });
    }
  }

  return cpy;
};
