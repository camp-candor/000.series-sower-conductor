import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sim from '../hunt.js';
import * as ActRemotion from '../35.remotion.unit/remotion.action.js';
import { inspectEjectLockHeader } from '../35.remotion.unit/buz/remotion.buzz.js';
import UnitData from '../BEE.js';

describe('packages/400.conductor 35.remotion.unit Candor Foundation', () => {
  const testDir = path.resolve(process.cwd(), 'scratch/test_remotion_unit');
  const unlockedFile = path.resolve(testDir, 'Episode_Unlocked.tsx');
  const lockedFile = path.resolve(testDir, 'Episode_Locked.tsx');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(unlockedFile, 'export const Episode = () => <div />;\n', 'utf8');
    fs.writeFileSync(
      lockedFile,
      '// @showrunner-lock: locked\n// Author: Director\nexport const Episode = () => <div />;\n',
      'utf8'
    );
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('strictly contains zero src/ directory in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('initializes UnitData with 400.conductor index and mounts remotion reducer', () => {
    const data = new UnitData();
    expect(data.idx).toBe('400.conductor');
    expect(data).toHaveProperty('remotion');
  });

  it('dispatches INIT_REMOTION cleanly via sim.hunt', async () => {
    const res = await sim.hunt!(ActRemotion.INIT_REMOTION, {});
    expect(res).toBeDefined();
    expect(res.remotionBit.val).toBe(1);
    expect(res.remotionBit.idx).toBe('init-remotion');
  });

  it('detects Showrunner Eject Lock marker correctly', () => {
    const unlockedStatus = inspectEjectLockHeader(unlockedFile);
    expect(unlockedStatus.isLocked).toBe(false);

    const lockedStatus = inspectEjectLockHeader(lockedFile);
    expect(lockedStatus.isLocked).toBe(true);
    expect(lockedStatus.lockAuthor).toBe('SHOWRUNNER_OVERRIDE');
  });

  it('dispatches CHECK_EJECT_LOCK via sim.hunt and reports lock state', async () => {
    const resLocked = await sim.hunt!(ActRemotion.CHECK_EJECT_LOCK, {
      src: lockedFile,
    });
    expect(resLocked.remotionBit.val).toBe(1);
    expect(resLocked.remotionBit.dat.isLocked).toBe(true);

    const resUnlocked = await sim.hunt!(ActRemotion.CHECK_EJECT_LOCK, {
      src: unlockedFile,
    });
    expect(resUnlocked.remotionBit.val).toBe(0);
    expect(resUnlocked.remotionBit.dat.isLocked).toBe(false);
  });

  it('fails closed when attempting to stamp over an eject-locked composition', async () => {
    const res = await sim.hunt!(ActRemotion.STAMP_STATIC_COMPOSITION, {
      dat: {
        outputTsxPath: lockedFile,
        shots: [{ id: 's1', frameCount: 10, source: 'foo.mp4' }],
        metadata: {
          episodeId: 'ep01',
          sceneId: 'sc01',
          fps: 24,
          width: 1920,
          height: 1080,
          totalDurationFrames: 75,
          outputTsxPath: lockedFile,
          layers: [],
          duckingTimeline: [],
          opticalConfig: {
            halationIntensityBps: 1500,
            filmGrainOpacityBps: 2000,
            colorLookupTable: 'lut_bleach.cube',
            enableDespill: true,
          },
        },
      },
    });

    expect(res.remotionBit.val).toBe(0);
    expect(res.remotionBit.src).toContain('EJECT_BUTTON_LOCKED');
  });
});
