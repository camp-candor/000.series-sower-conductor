import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sim from '../hunt.js';
import * as ActRemotion from '../35.remotion.unit/remotion.action.js';
import {
  computeCumulativeShotTimings,
  formatUnquotedLiteral,
} from '../35.remotion.unit/buz/literalBaking.buzz.js';
import {
  generateDespillSvgFilter,
  generateShotComponentCode,
} from '../35.remotion.unit/buz/opticalStack.buzz.js';
import { synthesizeStaticCompositionTsx } from '../35.remotion.unit/buz/remotion.buzz.js';

describe('packages/400.conductor 35.remotion.unit Static Metaprogram Generator Engine', () => {
  const testDir = path.resolve(process.cwd(), 'scratch/test_metaprogram');
  const outputTsx = path.resolve(testDir, 'Master_ep01_sc01.tsx');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  const sampleShots = [
    {
      shotId: 'sh01',
      characterId: 'char_elias',
      dialogueText: 'The line holds.',
      platePath: 'takes/elias_sh01.mp4',
      backgroundPath: 'backgrounds/bunker.png',
      durationMs: 3120, // 75 frames (diff: 77f, trim: 2f)
    },
    {
      shotId: 'sh02',
      characterId: 'char_torvin',
      dialogueText: 'For now.',
      platePath: 'takes/torvin_sh02.mp4',
      backgroundPath: 'backgrounds/bunker.png',
      durationMs: 2000, // 48 frames (diff: 49f, trim: 1f)
    },
  ];

  it('computes cumulative shot boundaries with zero drift across cuts', () => {
    const timed = computeCumulativeShotTimings(sampleShots);
    expect(timed.length).toBe(2);

    expect(timed[0].deliveryFrames).toBe(75);
    expect(timed[0].fromFrame).toBe(0);
    expect(timed[0].trimEndFrames).toBe(2);

    expect(timed[1].deliveryFrames).toBe(48);
    expect(timed[1].fromFrame).toBe(75);
    expect(timed[1].trimEndFrames).toBe(1);
  });

  it('generates shot code with unquoted numeric literals and isolated camera wrappers', () => {
    const timed = computeCumulativeShotTimings(sampleShots);
    const code = generateShotComponentCode(timed[0], 0);

    expect(code).toContain('const Shot01CameraWrapper: React.FC = () => {');
    expect(code).toContain('interpolate(frame, [0, 75], [0, 1]');
    expect(code).toContain('trimEndFrames={2}');
    expect(code).not.toContain('trimEndFrames={"2"}');
    expect(code).toContain('Layer 1: Static Environment Matte');
    expect(code).toContain('Layer 3: Grounded Character Plane');
    expect(code).toContain('Layer 4: Optical Mastering Lens Simulation');
  });

  it('stamps complete Remotion composition via sim.hunt and commits atomic .tmp POSIX swap', async () => {
    const res = await sim.hunt!(ActRemotion.STAMP_STATIC_COMPOSITION, {
      src: 'ep01_sc01',
      dat: {
        sceneId: 'ep01_sc01',
        outputTsxPath: outputTsx,
        shots: sampleShots,
      },
    });

    expect(res).toBeDefined();
    expect(res.remotionBit.val).toBe(1);
    expect(fs.existsSync(outputTsx)).toBe(true);
    expect(fs.existsSync(`${outputTsx}.tmp`)).toBe(false);

    const generatedCode = fs.readFileSync(outputTsx, 'utf8');
    expect(generatedCode).toContain('export const MasterScene_ep01_sc01: React.FC');
    expect(generatedCode).toContain('<Sequence from={0} durationInFrames={75}>');
    expect(generatedCode).toContain('<Sequence from={75} durationInFrames={48}>');
    expect(generatedCode).toContain('durationInFrames={123}');
    expect(generatedCode).toContain('filter: \'url(#greenscreen-despill)');
  });

  it('asserts 100% 7-bit ASCII compliance across generated composition code', () => {
    const timed = computeCumulativeShotTimings(sampleShots);
    const code = synthesizeStaticCompositionTsx('ep01_sc01', 123, timed);

    // eslint-disable-next-line no-control-regex
    const nonAsciiMatch = code.match(/[\u0080-\uFFFF]/);
    expect(nonAsciiMatch).toBeNull();
  });
});
