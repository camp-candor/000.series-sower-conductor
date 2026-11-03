import { describe, it, expect, vi } from 'vitest';
import sim from '../hunt.js';
import * as ActLog from '../04.logistic.unit/logistic.action.js';
import {
  buildSpokeExecutionPayload,
  executeSpokeDispatchWorkflow,
} from '../04.logistic.unit/buz/logistic.buzz.js';

describe('packages/400.conductor 04.logistic.unit Spoke Dispatch & Lease Coordination', () => {
  it('compiles SpokeExecutionPayload with locked 4n+1 diffusion lattice and #00FF00 chroma prompt', () => {
    const payload = buildSpokeExecutionPayload({
      sceneId: 'sc01',
      shotId: 'sh02',
      positivePrompt: 'Bog standing in murky water',
      loraTag: 'loras/characters/bog_v1.safetensors',
      loraSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
      canonMerkleRoot: '0000000000000000000000000000000000000000000000000000000000000000',
      masterDeliveryFrames: 75, // 75 -> 4(19) + 1 = 77
      seed: 42,
    });

    expect(payload.type).toBe('ENQUEUE_SHOT');
    expect(payload.jobId).toBe('job_sc01_sh02');
    expect(payload.workflowTemplate).toBe('wan_greenscreen_i2v.json');
    expect(payload.payload.masterDeliveryFrames).toBe(75);
    expect(payload.payload.diffusionAllocation).toBe(77);
    expect(payload.payload.prompt).toContain('hex #00FF00 backdrop');
    expect(payload.payload.prompt).toContain('studio chroma key isolation');
    expect(payload.idempotencyKey).toBeDefined();
  });

  it('trips DIRTY_SCENE_REJECTED at T_0 = $0.00 when edge returns HTTP 412', async () => {
    const payload = buildSpokeExecutionPayload({
      sceneId: 'sc_dirty_01',
      shotId: 'sh01',
      positivePrompt: 'Elias looks up',
      loraTag: 'loras/elias.safetensors',
      loraSha256: 'deadbeef',
      canonMerkleRoot: 'feedface',
      masterDeliveryFrames: 24,
      seed: 101,
    });

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/staleness/sc_dirty_01')) {
        return { status: 412, ok: false, json: async () => ({ is_dirty: 1 }) };
      }
      return { status: 200, ok: true, json: async () => ({}) };
    });

    await expect(
      executeSpokeDispatchWorkflow(payload, 'http://127.0.0.1:8787', {
        customFetch: mockFetch,
      })
    ).rejects.toThrow(/DIRTY_SCENE_REJECTED/);
  });

  it('executes clean lease acquisition and dispatch with monotonic epoch tracking', async () => {
    const payload = buildSpokeExecutionPayload({
      sceneId: 'sc02',
      shotId: 'sh01',
      positivePrompt: 'Vance inspecting circuit',
      loraTag: 'loras/vance.safetensors',
      loraSha256: 'beefcafe',
      canonMerkleRoot: 'cafedead',
      masterDeliveryFrames: 48,
      seed: 202,
    });

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/staleness/')) {
        return { status: 200, ok: true, json: async () => ({ is_dirty: 0 }) };
      }
      if (url.includes('/lease/acquire')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({ taskId: payload.jobId, epoch: 4, fencingToken: 4 }),
        };
      }
      if (url.includes('/dispatch')) {
        return { status: 200, ok: true, json: async () => ({ status: 'QUEUED' }) };
      }
      if (url.includes('/lease/heartbeat')) {
        return { status: 200, ok: true, json: async () => ({ status: 'HEARTBEAT_ACK' }) };
      }
      return { status: 404, ok: false };
    });

    const receipt = await executeSpokeDispatchWorkflow(payload, 'http://127.0.0.1:8787', {
      customFetch: mockFetch,
    });

    expect(receipt.status).toBe('DISPATCHED');
    expect(receipt.epoch).toBe(4);
    expect(receipt.jobId).toBe(payload.jobId);
  });

  it('aborts dispatch and trips ZOMBIE_LEASE_EPOCH when edge returns HTTP 409 Conflict', async () => {
    const payload = buildSpokeExecutionPayload({
      sceneId: 'sc03',
      shotId: 'sh01',
      positivePrompt: 'Prompt',
      loraTag: 'tag',
      loraSha256: 'hash',
      canonMerkleRoot: 'root',
      masterDeliveryFrames: 24,
      seed: 1,
    });

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/staleness/')) {
        return { status: 200, ok: true, json: async () => ({ is_dirty: 0 }) };
      }
      if (url.includes('/lease/acquire')) {
        return { status: 409, ok: false, json: async () => ({ error: 'EPOCH_MISMATCH' }) };
      }
      return { status: 200, ok: true };
    });

    await expect(
      executeSpokeDispatchWorkflow(payload, 'http://127.0.0.1:8787', {
        customFetch: mockFetch,
      })
    ).rejects.toThrow(/ZOMBIE_LEASE_EPOCH/);
  });

  it('dispatches COMPILE_SPOKE_PAYLOAD via sim.hunt cleanly', async () => {
    const res = await sim.hunt!(ActLog.COMPILE_SPOKE_PAYLOAD, {
      dat: {
        sceneId: 'sc01',
        shotId: 'sh01',
        positivePrompt: 'Elias in bunker',
        loraTag: 'elias_v1',
        loraSha256: 'sha256_mock',
        canonMerkleRoot: 'merkle_mock',
        masterDeliveryFrames: 48,
        seed: 777,
      },
    });

    expect(res).toBeDefined();
    expect(res.logisticBit.val).toBe(1);
    expect(res.logisticBit.dat.payload.diffusionAllocation).toBe(49); // 4(12) + 1
  });
});
