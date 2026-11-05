import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  compileAttentionSandwich,
  COUNTER_EXEMPLAR_PAIR,
  SLOP_FILTER_TOKENS,
} from '../34.abstractsyntaxtree.unit/buz/attentionSandwich.buzz.js';
import { compileSwainMru } from '../34.abstractsyntaxtree.unit/buz/swainMruCompiler.buzz.js';
import { sanitizeContextByOmission } from '../34.abstractsyntaxtree.unit/buz/epistemicSanitizer.buzz.js';
import { SceneContextPayload, MruBeatNode } from '../34.abstractsyntaxtree.unit/fce/sandwich.interface.js';

describe('packages/400.conductor Phase 2 Attention Sandwich Context Prompt Compilation', () => {
  const validPayload: SceneContextPayload = {
    seriesSlug: '001_candor_basin',
    actorA: {
      id: 'char_elias',
      constraints: {
        refusalVectors: ['Never admits failure to command'],
        somaticMask: {
          availableArms: 1,
          bannedKineticVerbs: ['heavy_lift', 'sprint'],
        },
      },
    },
    actorB: {
      id: 'char_torvin',
      constraints: {
        refusalVectors: ['Refuses to surrender the copper siphon'],
        somaticMask: {
          availableArms: 2,
          bannedKineticVerbs: [],
        },
      },
    },
    worldAxioms: [
      'Industrial salvage authority is strictly impersonal.',
      'Surface water is corrosive and unpotable.',
    ],
    slidingProseBuffer:
      'The steam curled up from the culvert grate. Elias kicked the loose shale and leaned against the flange.',
    surfaceDispute: 'Ownership of the brass pressure valve and missing grease tallies.',
    theUnderneathSecret: 'Elias concealed the structural breach in Sector 4.',
    dramaticParameters: {
      curtness: 0.85,
      pacing: 0.70,
      threat: 0.60,
      subtextSuppression: 0.80,
    },
    unforcedCollisionPremise:
      'Elias needs Torvin to inspect the valve; Torvin demands tally receipts first.',
    hardPhysicalExitTrigger:
      'Halt generation immediately when Torvin drops the wrench on the steel deck.',
    logisticalInventory: {
      char_elias: ['iron_flashlight'],
      char_torvin: ['copper_siphon', 'rusted_wrench'],
    },
    bannedTokens: ['breach', 'catastrophe', 'admit'],
  };

  it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd(), 'packages/400.conductor/src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('compiles tripartite 15/70/15 attention sandwich and estimates token budget', () => {
    const result = compileAttentionSandwich(validPayload);
    expect(result.top15Primacy).toBeDefined();
    expect(result.middle70Context).toBeDefined();
    expect(result.bottom15Recency).toBeDefined();
    expect(result.fullSerializedPrompt).toContain('[SYSTEM / IMMUTABLE LAWS (TOP 15% PRIMACY)]');
    expect(result.fullSerializedPrompt).toContain('[PASSIVE CONTEXT & MOMENTUM (MIDDLE 70% CONTEXT)]');
    expect(result.fullSerializedPrompt).toContain('[DYNAMIC ANCHORS & RECENCY (BOTTOM 15% RECENCY)]');

    expect(result.tokenBudgetEstimates.totalTokens).toBeGreaterThan(100);
    expect(result.topologyPercentages.primacyPct).toBeGreaterThan(0);
    expect(result.topologyPercentages.contextPct).toBeGreaterThan(0);
    expect(result.topologyPercentages.recencyPct).toBeGreaterThan(0);
  });

  it('injects counter-exemplar pair, somatic masks, refusal vectors, and slop filter into top 15%', () => {
    const result = compileAttentionSandwich(validPayload);
    expect(result.top15Primacy).toContain(COUNTER_EXEMPLAR_PAIR);
    expect(result.top15Primacy).toContain('AVAILABLE_ARMS: 1');
    expect(result.top15Primacy).toContain('BANNED_KINETIC_VERBS: [heavy_lift, sprint]');
    expect(result.top15Primacy).toContain('Never admits failure to command');
    for (const token of SLOP_FILTER_TOKENS.slice(0, 3)) {
      expect(result.top15Primacy).toContain(token);
    }
  });

  it('isolates the underneath secret behind subtext suppression directives when S >= 0.70', () => {
    const result = compileAttentionSandwich(validPayload);
    expect(result.middle70Context).toContain('[SUBTEXT SUPPRESSION ACTIVE (S >= 0.70)]');
    expect(result.middle70Context).toContain('THE UNDERNEATH');
    expect(result.middle70Context).toContain('Elias concealed the structural breach in Sector 4.');
  });

  it('strips schemas, exit triggers, and logistics in Stage 0A collision pass mode', () => {
    const stage0APayload: SceneContextPayload = {
      ...validPayload,
      stage0ACollisionMode: true,
    };

    const result = compileAttentionSandwich(stage0APayload);
    expect(result.bottom15Recency).toContain('[STAGE 0A: ZERO-GRAMMAR ZERO-LOGISTICS COLLISION MODE]');
    expect(result.bottom15Recency).toContain('GBNF schemas, equipment slot locks, and door boundaries are STRIPPED.');
    expect(result.bottom15Recency).not.toContain('HARD PHYSICAL EXIT CONDITION');
    expect(result.bottom15Recency).toContain(validPayload.unforcedCollisionPremise);
  });

  it('compiles Dwight Swain MRU causality structures with preroll frame intervals', () => {
    const nodes: MruBeatNode[] = [
      {
        beatId: 'beat_01',
        characterId: 'char_elias',
        motivationStimulus: 'Torvin points the flashlight into the water pipe.',
        visceralReaction: 'Elias tenses his shoulder muscles and looks down.',
        calculatedAction: 'He takes a slow step to block the culvert mouth.',
        dialogueText: 'Nothing in that pipe for you, Torvin.',
        prerollFrames: 18,
      },
    ];

    const mruOutput = compileSwainMru(nodes);
    expect(mruOutput).toContain('DWIGHT SWAIN MRU CAUSAL EXECUTION BLOCKS');
    expect(mruOutput).toContain('1. MOTIVATING STIMULUS: Torvin points the flashlight');
    expect(mruOutput).toContain('2. INVOLUNTARY VISCERAL REFLEX: Elias tenses');
    expect(mruOutput).toContain('3. CONSCIOUS MOTOR ACTION: He takes a slow step');
    expect(mruOutput).toContain('4. SPOKEN DIALOGUE: "Nothing in that pipe for you, Torvin."');
    expect(mruOutput).toContain('PREROLL REACTION INTERVAL: 18 frames');
  });

  it('sanitizes context by scrubbing omitted topic IDs and camera tags', () => {
    const rawProse =
      'Elias looked at the valve. <camera_parenthetical>Close up on eyes</camera_parenthetical> He remembered mystery_breach_44.';
    const cleaned = sanitizeContextByOmission(rawProse, ['mystery_breach_44']);
    expect(cleaned).not.toContain('mystery_breach_44');
    expect(cleaned).toContain('[REDACTED_TOPIC]');
    expect(cleaned).not.toContain('<camera_parenthetical>');
  });

  it('asserts 100% pure 7-bit ASCII compliance across 34.abstractsyntaxtree.unit', () => {
    const dir = path.resolve(process.cwd(), 'packages/400.conductor/34.abstractsyntaxtree.unit');
    const scanDir = (target: string) => {
      const entries = fs.readdirSync(target, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(target, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.ts')) {
          const content = fs.readFileSync(full, 'utf8');
          // eslint-disable-next-line no-control-regex
          const match = content.match(/[\u0080-\uFFFF]/);
          expect(match).toBeNull();
        }
      }
    };
    scanDir(dir);
  });
});
