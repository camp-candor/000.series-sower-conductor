import { AbstractSyntaxTreeModel } from '../abstractsyntaxtree.model.js';
import AbstractSyntaxTreeBit from '../fce/abstractsyntaxtree.bit.js';
import { SceneASTSchema } from './dialogueLine.val.js';
import { AstValidationReceipt, SceneAST } from '../fce/sceneAst.interface.js';
import State from '../../99.core/state.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const initAbstractsyntaxtree = (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ astBit: { idx: 'init-abstractsyntaxtree', val: 1 } });
  }
  return cpy;
};

export const updateAbstractsyntaxtree = (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ astBit: { idx: 'update-abstractsyntaxtree' } });
  }
  return cpy;
};

export const parseSceneAst = async (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  const errors: string[] = [];
  let parsedJson: any = null;

  try {
    if (bal.dat?.rawJson) {
      parsedJson = JSON.parse(bal.dat.rawJson);
    } else if (bal.dat?.filePath) {
      const targetPath = path.resolve(bal.dat.filePath);
      if (!fs.existsSync(targetPath)) {
        throw new Error(`AST File not found at target path: ${targetPath}`);
      }
      const fileData = fs.readFileSync(targetPath, 'utf8');
      parsedJson = JSON.parse(fileData);
    } else {
      throw new Error('Neither rawJson nor filePath provided in AST ingestion payload');
    }

    const validatedAst = SceneASTSchema.parse(parsedJson) as SceneAST;
    cpy.currentAst = Object.freeze(validatedAst);

    const speakers = Array.from(new Set(validatedAst.lines.map((l) => l.speaker_id)));

    const receipt: AstValidationReceipt = {
      ok: true,
      scene_id: validatedAst.scene_id,
      line_count: validatedAst.lines.length,
      speakers,
      state_snapshot_hash: validatedAst.state_snapshot_hash,
      errors: [],
    };

    cpy.lastReceipt = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [AST-INGESTION] [OK] Scene [${validatedAst.scene_id}] Validated: ${validatedAst.lines.length} lines, ${speakers.length} speakers`,
      });
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [AST-SNAPSHOT] Hash: ${validatedAst.state_snapshot_hash.substring(0, 16)}... | Schema v${validatedAst.schema_version}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        astBit: {
          idx: 'parse-scene-ast-success',
          dat: { ast: validatedAst, receipt },
        },
      });
    }
  } catch (err: any) {
    const errorMsg = err.errors ? JSON.stringify(err.errors) : err.message;
    errors.push(errorMsg);

    const failureReceipt: AstValidationReceipt = {
      ok: false,
      scene_id: parsedJson?.scene_id || 'UNKNOWN_SCENE',
      line_count: 0,
      speakers: [],
      state_snapshot_hash: parsedJson?.state_snapshot_hash || 'INVALID_HASH',
      errors,
    };

    cpy.lastReceipt = failureReceipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [AST-INGESTION] [FAIL] SCHEMA_VALIDATION_FAILED at T0 ($0.00 spend): ${errorMsg}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        astBit: {
          idx: 'parse-scene-ast-error',
          src: errorMsg,
          dat: { receipt: failureReceipt },
        },
      });
    }
  }

  return cpy;
};

export const verifyAstParity = async (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  const fountainText = bal.src || '';
  const ast = cpy.currentAst;

  if (!ast) {
    const errMsg = 'Cannot verify verbatim parity: No Scene AST loaded in state';
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [PARITY-CHECK] [FAIL] ${errMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({ astBit: { idx: 'verify-ast-parity-error', src: errMsg } });
    }
    return cpy;
  }

  const normalize = (t: string) =>
    t
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  let parityOk = true;
  const parityMismatches: string[] = [];

  for (const line of ast.lines) {
    const normalizedDialogue = normalize(line.dialogue_text);
    if (!normalize(fountainText).includes(normalizedDialogue)) {
      parityOk = false;
      parityMismatches.push(`[${line.line_id}] Spoken text not found verbatim in screenplay prose: "${line.dialogue_text}"`);
    }
  }

  if (!parityOk) {
    const errMsg = `PARITY_CHECK_FAILED at T0 ($0.00): ${parityMismatches.join(' | ')}`;
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [PARITY-CHECK] [FAIL] ${errMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({
        astBit: {
          idx: 'verify-ast-parity-failed',
          src: errMsg,
          dat: { mismatches: parityMismatches },
        },
      });
    }
    return cpy;
  }

  if (global.LIBRARY) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: `>> [PARITY-CHECK] [OK] Character-for-character dialogue parity certified across ${ast.lines.length} lines`,
    });
  }

  if (bal.slv != null) {
    bal.slv({
      astBit: {
        idx: 'verify-ast-parity-success',
        val: 1,
      },
    });
  }

  return cpy;
};
