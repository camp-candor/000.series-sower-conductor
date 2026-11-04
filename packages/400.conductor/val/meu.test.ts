import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sim from '../hunt.js';
import * as ActRemotion from '../35.remotion.unit/remotion.action.js';
import {
  executeSurgicalMeuAstMutation,
  applyShowrunnerLock,
} from '../35.remotion.unit/buz/meuRepair.buzz.js';
import { generateUniversalProvenanceLockfile } from '../35.remotion.unit/buz/provenance.buzz.js';

describe('packages/400.conductor 35.remotion.unit MEU Surgery & Provenance Sealing', () => {
  const testDir = path.resolve(process.cwd(), 'scratch/test_meu_unit');
  const targetTsx = path.resolve(testDir, 'Shot_Candidate.tsx');

  const baseTsxContent = `
import React from 'react';
import { Sequence, OffthreadVideo } from 'remotion';

export const Shot01CameraWrapper: React.FC = () => {
  return (
    <Sequence from={0} durationInFrames={75}>
      <OffthreadVideo src="plate.mp4" trimEndFrames={2} />
    </Sequence>
  );
};
  `.trim();

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(targetTsx, baseTsxContent, 'utf8');
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('executes surgical AST mutation modifying trimEndFrames in place', () => {
    const result = executeSurgicalMeuAstMutation({
      ticketId: 'tkt_001',
      targetFile: targetTsx,
      componentName: 'OffthreadVideo',
      propName: 'trimEndFrames',
      newValue: 5,
      cycleCount: 1,
      reason: 'Trim slack adjustment',
    });

    expect(result.success).toBe(true);

    const updatedCode = fs.readFileSync(targetTsx, 'utf8');
    expect(updatedCode).toContain('trimEndFrames={5}');
    expect(updatedCode).toContain('@lifecycle: patched [ticket: tkt_001]');
    expect(updatedCode).toContain('durationInFrames={75}'); // Unaffected prop preserved
  });

  it('fails closed with CIRCUIT_BREAKER_TRIPPED when cycleCount >= 3', () => {
    expect(() =>
      executeSurgicalMeuAstMutation({
        ticketId: 'tkt_strike3',
        targetFile: targetTsx,
        componentName: 'OffthreadVideo',
        propName: 'trimEndFrames',
        newValue: 5,
        cycleCount: 3,
        reason: 'Repeated failure to converge',
      })
    ).toThrow(/CIRCUIT_BREAKER_TRIPPED/);

    const quarantineDir = path.resolve(process.cwd(), process.cwd().endsWith('400.conductor') ? '' : 'packages/400.conductor', 'vault/quarantine');
    expect(fs.existsSync(quarantineDir)).toBe(true);
  });

  it('refuses mutation and trips EJECT_BUTTON_LOCKED on showrunner-locked file', () => {
    applyShowrunnerLock(targetTsx, 'DIRECTOR_KAEL');

    expect(() =>
      executeSurgicalMeuAstMutation({
        ticketId: 'tkt_eject',
        targetFile: targetTsx,
        componentName: 'OffthreadVideo',
        propName: 'trimEndFrames',
        newValue: 4,
        cycleCount: 1,
        reason: 'Attempt override',
      })
    ).toThrow(/EJECT_BUTTON_LOCKED/);
  });

  it('seals universal provenance lockfile with asset digests and git SHA', () => {
    const mockMetadata = {
      episodeId: 'ep01',
      sceneId: 'sc01',
      fps: 24 as const,
      width: 1920 as const,
      height: 1080 as const,
      totalDurationFrames: 75,
      outputTsxPath: targetTsx,
      layers: [
        {
          layerId: 'ly1',
          layerType: 'CHARACTER_PLATE' as const,
          assetPath: targetTsx,
          fromFrame: 0,
          durationInFrames: 75,
          trimEndFrames: 2,
          zIndex: 30,
          transformOriginX: 50,
          transformOriginY: 85,
        },
      ],
      duckingTimeline: [],
      opticalConfig: {
        halationIntensityBps: 1500,
        filmGrainOpacityBps: 2000,
        colorLookupTable: 'lut.cube',
        enableDespill: true,
      },
    };

    const result = generateUniversalProvenanceLockfile({
      episodeId: 'ep01',
      sceneId: 'sc01',
      metadata: mockMetadata,
      canonMerkleRoot: '4f8a91b2c48d0e5f29910381640a23d91fca018a4f8a91b2c48d0e5f29910381',
      outputDirectory: path.join(testDir, 'snapshots'),
    });

    expect(fs.existsSync(result.lockfilePath)).toBe(true);

    const lockData = JSON.parse(fs.readFileSync(result.lockfilePath, 'utf8'));
    expect(lockData.manifestVersion).toBe('1.0.0');
    expect(lockData.episodeId).toBe('ep01');
    expect(lockData.canonMerkleRoot).toBe('4f8a91b2c48d0e5f29910381640a23d91fca018a4f8a91b2c48d0e5f29910381');
    expect(lockData.assetDigests[targetTsx]).toBeDefined();
  });

  it('dispatches MUTATE_MEU_AST cleanly through sim.hunt', async () => {
    const res = await sim.hunt!(ActRemotion.MUTATE_MEU_AST, {
      dat: {
        ticketId: 'tkt_hunt_01',
        targetFile: targetTsx,
        componentName: 'OffthreadVideo',
        propName: 'trimEndFrames',
        newValue: 3,
        cycleCount: 1,
        reason: 'Hunt test',
      },
    });

    expect(res).toBeDefined();
    expect(res.remotionBit.val).toBe(1);
    expect(res.remotionBit.src).toBe(targetTsx);
  });
});
