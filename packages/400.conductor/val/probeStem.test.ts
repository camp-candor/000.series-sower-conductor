import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { probeStemDuration, EMPTY_SHA256 } from '../24.frame.unit/buz/probeStem.buzz.js';
import { FrameModel } from '../24.frame.unit/frame.model.js';
import type FrameBit from '../24.frame.unit/fce/frame.bit.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Feature 2.1 Uncompressed Stem Duration Probing', () => {
  const model = new FrameModel();
  const tmpDir = path.resolve(__dirname, '../val/tmp_test_audio');

  beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('probes a valid audio stem using mock duration injection', async () => {
    const bal: FrameBit = {
      idx: 'test-valid-stem',
      dat: {
        probeRequest: {
          shot_id: 'shot_101',
          wav_path: 'mock/path/audio.wav',
          mock_duration_ms: 3120,
        },
      },
      slv: (res) => {
        const result = res.frmBit.dat?.probeResult;
        expect(result).toBeDefined();
        expect(result?.ok).toBe(true);
        expect(result?.duration_ms).toBe(3120);
        expect(result?.sample_count).toBe(149760); // 3.120 * 48000
        expect(result?.audio_spec.sample_rate_hz).toBe(48000);
      },
    };

    await probeStemDuration(model, bal);
  });

  it('fails closed when encountering a zero-byte poisoned stem', async () => {
    const poisonFile = path.join(tmpDir, 'zero_byte.wav');
    fs.writeFileSync(poisonFile, Buffer.alloc(0));

    let failed = false;
    const bal: FrameBit = {
      idx: 'test-zero-byte',
      dat: {
        probeRequest: {
          shot_id: 'shot_poison',
          wav_path: poisonFile,
        },
      },
      slv: (res) => {
        failed = true;
        const result = res.frmBit.dat?.probeResult;
        expect(result?.ok).toBe(false);
        expect(result?.error).toContain('ZERO_BYTE_POISON');
      },
    };

    await probeStemDuration(model, bal);
    expect(failed).toBe(true);
  });

  it('fails closed when file size is under the 1024-byte header threshold', async () => {
    const corruptFile = path.join(tmpDir, 'corrupt_short.wav');
    fs.writeFileSync(corruptFile, Buffer.alloc(512, 0x41));

    let failed = false;
    const bal: FrameBit = {
      idx: 'test-short-header',
      dat: {
        probeRequest: {
          shot_id: 'shot_corrupt',
          wav_path: corruptFile,
        },
      },
      slv: (res) => {
        failed = true;
        const result = res.frmBit.dat?.probeResult;
        expect(result?.ok).toBe(false);
        expect(result?.error).toContain('ZERO_BYTE_POISON');
      },
    };

    await probeStemDuration(model, bal);
    expect(failed).toBe(true);
  });

  it('verifies 100% 7-bit clean ASCII compliance in probe source files', () => {
    const probeFile = path.resolve(__dirname, '../24.frame.unit/buz/probeStem.buzz.ts');
    const content = fs.readFileSync(probeFile, 'utf8');
    expect(/[\u0080-\uFFFF]/.test(content)).toBe(false);
  });
});
