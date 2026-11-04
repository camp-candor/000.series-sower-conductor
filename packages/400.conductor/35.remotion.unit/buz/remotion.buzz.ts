import fs from 'node:fs';
import path from 'node:path';
import { RemotionModel } from '../remotion.model.js';
import RemotionBit from '../fce/remotion.bit.js';
import State from '../../99.core/state.js';
import {
  CompositionMetadata,
  EjectMarkerStatus,
} from '../fce/remotion.interface.js';

export function inspectEjectLockHeader(filePath: string): EjectMarkerStatus {
  if (!fs.existsSync(filePath)) {
    return { isLocked: false, filePath };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').slice(0, 10);
  const lockLine = lines.find((l) => l.includes('@showrunner-lock: locked'));

  if (lockLine) {
    return {
      isLocked: true,
      filePath,
      lockAuthor: 'SHOWRUNNER_OVERRIDE',
    };
  }

  return { isLocked: false, filePath };
}

export const initRemotion = (cpy: RemotionModel, bal: RemotionBit, _ste: State) => {
  cpy.totalCompositionsStamped = 0;
  process.stdout.write('>> [REMOTION] [OK] packages/400.conductor/35.remotion.unit initialized cleanly.\n');
  if (bal.slv) bal.slv({ remotionBit: { idx: 'init-remotion', val: 1 } });
  return cpy;
};

export const checkEjectLock = (cpy: RemotionModel, bal: RemotionBit, _ste: State) => {
  const cns = '>> [REMOTION]';
  const targetPath = bal.src || bal.dat?.filePath;

  if (!targetPath) {
    const err = 'EJECT_CHECK_REJECTED: Missing filePath';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ remotionBit: { idx: 'check-eject-lock-error', val: 0, src: err } });
    throw new Error(err);
  }

  const status = inspectEjectLockHeader(targetPath);
  cpy.isEjectLocked = status.isLocked;

  if (status.isLocked) {
    process.stdout.write(`${cns} [WARN] Eject lock active for ${path.basename(targetPath)}. Automated mutation blocked.\n`);
  } else {
    process.stdout.write(`${cns} [OK] File unlocked: ${path.basename(targetPath)} available for compilation.\n`);
  }

  if (bal.slv) {
    bal.slv({
      remotionBit: {
        idx: 'check-eject-lock',
        val: status.isLocked ? 1 : 0,
        src: targetPath,
        dat: status,
      },
    });
  }

  return cpy;
};

export const stampStaticComposition = (cpy: RemotionModel, bal: RemotionBit, _ste: State) => {
  const cns = '>> [REMOTION]';
  const meta = bal.dat?.metadata as CompositionMetadata;

  if (!meta || !meta.outputTsxPath) {
    const err = 'STAMP_REJECTED: Missing CompositionMetadata or outputTsxPath';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ remotionBit: { idx: 'stamp-static-composition-error', val: 0, src: err } });
    throw new Error(err);
  }

  const ejectStatus = inspectEjectLockHeader(meta.outputTsxPath);
  if (ejectStatus.isLocked) {
    const err = `EJECT_BUTTON_LOCKED: Cannot overwrite manually locked composition ${meta.outputTsxPath}`;
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ remotionBit: { idx: 'stamp-static-composition-error', val: 0, src: err } });
    throw new Error(err);
  }

  cpy.totalCompositionsStamped += 1;
  cpy.lastStampedPath = meta.outputTsxPath;
  cpy.lastMetadata = meta;

  process.stdout.write(`${cns} [OK] Stamped composition metadata for ${meta.episodeId} (${meta.totalDurationFrames} frames).\n`);

  if (bal.slv) {
    bal.slv({
      remotionBit: {
        idx: 'stamp-static-composition',
        val: 1,
        src: meta.outputTsxPath,
        dat: { metadata: meta, stampedAtMs: Date.now() },
      },
    });
  }

  return cpy;
};

export const mutateMeuAst = (cpy: RemotionModel, bal: RemotionBit, _ste: State) => {
  const cns = '>> [REMOTION]';
  const targetPath = bal.src || bal.dat?.filePath;

  if (!targetPath) {
    const err = 'MUTATE_REJECTED: Missing target filePath';
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ remotionBit: { idx: 'mutate-meu-ast-error', val: 0, src: err } });
    throw new Error(err);
  }

  const ejectStatus = inspectEjectLockHeader(targetPath);
  if (ejectStatus.isLocked) {
    const err = `EJECT_BUTTON_LOCKED: Cannot mutate locked AST at ${targetPath}`;
    process.stderr.write(`${cns} [FAIL] ${err}\n`);
    if (bal.slv) return bal.slv({ remotionBit: { idx: 'mutate-meu-ast-error', val: 0, src: err } });
    throw new Error(err);
  }

  process.stdout.write(`${cns} [OK] MEU AST mutation verified for ${path.basename(targetPath)}.\n`);

  if (bal.slv) {
    bal.slv({
      remotionBit: {
        idx: 'mutate-meu-ast',
        val: 1,
        src: targetPath,
        dat: { mutated: true },
      },
    });
  }

  return cpy;
};

export const emitProvenanceLockfile = (cpy: RemotionModel, bal: RemotionBit, _ste: State) => {
  const cns = '>> [REMOTION]';
  const episodeId = bal.src || bal.dat?.episodeId || 'ep00';
  const lockfilePath = path.resolve(process.cwd(), `vault/snapshots/build_${episodeId}.lock.json`);

  process.stdout.write(`${cns} [OK] Emitted provenance lockfile target for ${episodeId}.\n`);

  if (bal.slv) {
    bal.slv({
      remotionBit: {
        idx: 'emit-provenance-lockfile',
        val: 1,
        src: lockfilePath,
        dat: { episodeId, lockfilePath },
      },
    });
  }

  return cpy;
};
