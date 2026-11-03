import { describe, it, expect } from 'vitest';
import sim from '../hunt.js';
import * as ActCpus from '../28.cpus.unit/cpus.action.js';
import * as ActCuda from '../27.cuda.unit/cuda.action.js';
import { checkComputeResources, checkIsolateEnvironment } from '../28.cpus.unit/buz/cpus.buzz.js';
import { evaluateZeroVramPolicy } from '../27.cuda.unit/buz/cuda.buzz.js';

describe('packages/400.conductor Pre-Flight Hardware Gate', () => {
  it('passes hardware preflight on valid host via sim.hunt', async () => {
    const res = await sim.hunt!(ActCpus.VERIFY_HARDWARE_PREFLIGHT, {});
    expect(res).toBeDefined();
    expect(res.cpusBit.val).toBe(1);
    expect(res.cpusBit.dat.cores).toBeGreaterThanOrEqual(1);
  });

  it('verifies Zero-VRAM policy enforcement via sim.hunt', async () => {
    const res = await sim.hunt!(ActCuda.ASSERT_ZERO_VRAM, {});
    expect(res).toBeDefined();
    expect(res.cudaBit.val).toBe(1);
    expect(res.cudaBit.dat.zeroVramEnforced).toBe(true);
  });

  it('negative control: blocks Cloudflare Worker isolates', () => {
    const originalNavigator = (globalThis as any).navigator;

    // Bypass getter-only navigator issue by using Object.defineProperty
    Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Cloudflare-Workers' },
        configurable: true
    });

    expect(() => {
      checkIsolateEnvironment();
    }).toThrow('ISOLATE_ENVIRONMENT_DETECTED');

    if (originalNavigator) {
        Object.defineProperty(globalThis, 'navigator', {
            value: originalNavigator,
            configurable: true
        });
    } else {
        delete (globalThis as any).navigator;
    }
  });

  it('negative control: throws on insufficient CPU cores or RAM', () => {
    expect(() => {
      checkComputeResources(999, 1024 * 1024 * 1024 * 1024); // will pass
    }).not.toThrow();

    expect(() => {
      checkComputeResources(2, 1024 * 1024 * 1024 * 1024); // will fail on cores
    }).toThrow('INSUFFICIENT_HARDWARE_RESOURCES');

    expect(() => {
      checkComputeResources(8, 1024 * 1024 * 1024); // will fail on ram
    }).toThrow('INSUFFICIENT_HARDWARE_RESOURCES');
  });

  it('negative control: trips on dedicated GPU presence without override', () => {
    const mockEnv = { CUDA_VISIBLE_DEVICES: '0', ALLOW_RIG1_GPU_OVERRIDE: 'false' };
    expect(() => {
      evaluateZeroVramPolicy(mockEnv as any);
    }).toThrow('DEDICATED_GPU_DETECTED_ON_RIG1');
  });

  it('allows GPU presence only when ALLOW_RIG1_GPU_OVERRIDE is true', () => {
    const mockEnv = { CUDA_VISIBLE_DEVICES: '0', ALLOW_RIG1_GPU_OVERRIDE: 'true' };
    const result = evaluateZeroVramPolicy(mockEnv as any);
    expect(result.zeroVramEnforced).toBe(false);
    expect(result.gpuOverrideActive).toBe(true);
  });
});
