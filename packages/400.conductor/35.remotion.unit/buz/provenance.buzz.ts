import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  CompositionMetadata,
  UniversalProvenanceManifest,
} from '../fce/remotion.interface.js';

export function calculateFileSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function resolveCurrentGitCommitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('ascii')
      .trim();
  } catch {
    return '0000000000000000000000000000000000000000';
  }
}

export function generateUniversalProvenanceLockfile(params: {
  episodeId: string;
  sceneId: string;
  metadata: CompositionMetadata;
  canonMerkleRoot?: string;
  outputDirectory?: string;
}): { manifest: UniversalProvenanceManifest; lockfilePath: string } {
  const cns = '>> [PROVENANCE]';
  const outDir = params.outputDirectory || path.resolve(process.cwd(), 'vault/snapshots');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const assetDigests: Record<string, string> = {};

  // Hash target TSX composition
  if (params.metadata.outputTsxPath) {
    assetDigests[params.metadata.outputTsxPath] = calculateFileSha256(params.metadata.outputTsxPath);
  }

  // Hash every referenced sequence layer asset
  for (const layer of params.metadata.layers) {
    if (layer.assetPath) {
      assetDigests[layer.assetPath] = calculateFileSha256(layer.assetPath);
    }
  }

  const manifest: UniversalProvenanceManifest = {
    manifestVersion: '1.0.0',
    episodeId: params.episodeId,
    sceneId: params.sceneId,
    sealedAtMs: Date.now(),
    gitCommitSha: resolveCurrentGitCommitSha(),
    canonMerkleRoot:
      params.canonMerkleRoot || '0000000000000000000000000000000000000000000000000000000000000000',
    toolchain: {
      nodeVersion: process.version,
      remotionVersion: '4.0.0',
    },
    assetDigests,
  };

  const lockfilePath = path.join(outDir, `build_${params.episodeId}.lock.json`);
  const tmpPath = `${lockfilePath}.tmp`;

  fs.writeFileSync(tmpPath, JSON.stringify(manifest, null, 2), 'utf8');
  fs.renameSync(tmpPath, lockfilePath);

  process.stdout.write(
    `${cns} [OK] Universal Provenance Manifest sealed for ${params.episodeId} (${Object.keys(assetDigests).length} assets locked).\n`
  );

  return { manifest, lockfilePath };
}
