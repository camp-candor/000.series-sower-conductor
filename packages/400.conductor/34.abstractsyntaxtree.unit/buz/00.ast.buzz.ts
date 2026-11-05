import { AstModel } from '../ast.model.js';
import AstBit from '../fce/ast.bit.js';
import State from '../../99.core/state.js';
import { compileAttentionSandwich } from './attentionSandwich.buzz.js';
import { compileSwainMru } from './swainMruCompiler.buzz.js';
import { SceneContextPayload, MruBeatNode } from '../fce/sandwich.interface.js';

export const initAst = async (
  cpy: AstModel,
  bal: AstBit,
  _ste: State
) => {
  cpy.status = 'INITIALIZED';
  cpy.lastActionTimestamp = Date.now();
  if (bal.slv) bal.slv({ astBit: { idx: 'init-ast', val: 1 } });
  return cpy;
};

export const updateAst = async (
  cpy: AstModel,
  bal: AstBit,
  _ste: State
) => {
  cpy.lastActionTimestamp = Date.now();
  if (bal.slv) bal.slv({ astBit: { idx: 'update-ast', val: 1 } });
  return cpy;
};

export const compileAttentionSandwichBuzz = async (
  cpy: AstModel,
  bal: AstBit,
  _ste: State
) => {
  const payload = bal.dat?.payload as SceneContextPayload;
  if (!payload) {
    if (bal.slv) bal.slv({ astBit: { idx: 'compile-attention-sandwich', val: 0, src: 'MISSING_PAYLOAD' } });
    return cpy;
  }

  const compiled = compileAttentionSandwich(payload);
  cpy.lastSandwich = compiled;
  cpy.lastCompiledPrompt = compiled.fullSerializedPrompt;
  cpy.status = 'COMPILED_SANDWICH';
  cpy.lastActionTimestamp = Date.now();

  process.stdout.write(
    `>> [SANDWICH] [OK] Prompt compiled (${compiled.tokenBudgetEstimates.totalTokens} tokens: ${compiled.topologyPercentages.primacyPct}%/${compiled.topologyPercentages.contextPct}%/${compiled.topologyPercentages.recencyPct}%).\n`
  );

  if (bal.slv) {
    bal.slv({
      astBit: {
        idx: 'compile-attention-sandwich',
        val: 1,
        src: 'COMPILED',
        dat: { compiled },
      },
    });
  }

  return cpy;
};

export const compileSwainMruBuzz = async (
  cpy: AstModel,
  bal: AstBit,
  _ste: State
) => {
  const nodes = (bal.dat?.mruNodes || []) as MruBeatNode[];
  const mruOutput = compileSwainMru(nodes);
  cpy.status = 'COMPILED_MRU';
  cpy.lastActionTimestamp = Date.now();

  process.stdout.write(`>> [MRU] [OK] Compiled ${nodes.length} Dwight Swain MRU blocks.\n`);

  if (bal.slv) {
    bal.slv({
      astBit: {
        idx: 'compile-swain-mru',
        val: 1,
        src: 'COMPILED',
        dat: { mruOutput },
      },
    });
  }

  return cpy;
};
