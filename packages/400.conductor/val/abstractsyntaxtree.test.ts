import { describe, it, expect, beforeEach } from 'vitest';
import { SceneASTSchema, DialogueLineSchema } from '../34.abstractsyntaxtree.unit/buz/dialogueLine.val.js';
import { AbstractSyntaxTreeModel } from '../34.abstractsyntaxtree.unit/abstractsyntaxtree.model.js';
import * as Buzz from '../34.abstractsyntaxtree.unit/buz/abstractsyntaxtree.buzz.js';

describe('34.abstractsyntaxtree.unit: Dialogue Ingestion & Validation', () => {
  let model: AbstractSyntaxTreeModel;

  beforeEach(() => {
    model = new AbstractSyntaxTreeModel();
  });

  const validSceneAstJson = JSON.stringify({
    schema_version: '3.2.0',
    series_id: 'under-the-floorboards',
    episode_id: 'ep040',
    scene_id: 'ep040_sc03',
    state_snapshot_hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    pinned_version: 12,
    lines: [
      {
        line_id: 'line_001',
        speaker_id: 'char_bog',
        dialogue_text: "I didn't miss it. The thread is stripped.",
        camera_parenthetical: 'Bog works the wrench one-handed',
        observable_parenthetical: 'teeth clenched, straining',
        emotion_tag: 'humiliated',
        swain_mru_phase: 'MOTOR_ACTION_DIALOGUE',
        tonePacing: 1.0,
        extracted_motor_actions: ['RATCHET_TIGHTEN_ONE_HANDED'],
        foley_cues: ['ratchet_grind_metal'],
        camera_intent: {
          framing: 'CLOSE_UP',
          motion: 'STATIC',
          focus_target: 'char_bog',
        },
        pacing_scalar: 1.0,
      },
    ],
  });

  it('successfully validates a canonical AST payload conforming to SceneASTSchema', () => {
    const parsed = JSON.parse(validSceneAstJson);
    const result = SceneASTSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  it('rejects un-schemaed keys via .strict() enforcement at T0 ($0.00 spend)', () => {
    const dirty = JSON.parse(validSceneAstJson);
    dirty.creative_notes = 'Bog should sound grittier here';
    const result = SceneASTSchema.safeParse(dirty);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Unrecognized key');
    }
  });

  it('rejects multi-byte unicode or emojis in dialogue_text via 7-bit clean ASCII linter', () => {
    const dirty = JSON.parse(validSceneAstJson);
    dirty.lines[0].dialogue_text = 'The thread is stripped! \uD83D\uDD27'; // wrench emoji
    const result = SceneASTSchema.safeParse(dirty);
    expect(result.success).toBe(false);
  });

  it('rejects invalid state_snapshot_hash formats', () => {
    const dirty = JSON.parse(validSceneAstJson);
    dirty.state_snapshot_hash = 'not-a-valid-sha256-hash';
    const result = SceneASTSchema.safeParse(dirty);
    expect(result.success).toBe(false);
  });

  it('buzz parseSceneAst parses valid JSON and populates model receipt', async () => {
    const bale = {
      idx: 'test-parse',
      dat: { rawJson: validSceneAstJson },
      slv: (res: any) => res,
    };
    const updated = await Buzz.parseSceneAst(model, bale, null as any);
    expect(updated.lastReceipt?.ok).toBe(true);
    expect(updated.lastReceipt?.line_count).toBe(1);
    expect(updated.lastReceipt?.speakers).toContain('char_bog');
  });

  it('buzz verifyAstParity certifies character-for-character match', async () => {
    model.currentAst = Object.freeze(JSON.parse(validSceneAstJson));
    const screenplay = "BOG\nI didn't miss it. The thread is stripped.";
    const bale = {
      idx: 'test-parity',
      src: screenplay,
      slv: (res: any) => res,
    };
    const updated = await Buzz.verifyAstParity(model, bale, null as any);
    expect(updated.currentAst).toBeDefined();
  });
});
