import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MenuModel } from '../98.menu.unit/menu.model.js';
import * as Buzz from '../98.menu.unit/buz/00.menu.buzz.js';
import * as Stream from '../98.menu.unit/buz/telemetryStreamer.buzz.js';

describe('98.menu.unit: Blessed Terminal Cockpit Navigation & Telemetry Control', () => {
  let model: MenuModel;

  beforeEach(() => {
    model = new MenuModel();
  });

  afterEach(() => {
    delete (global as any).MICROSERVICEAUDIO;
    delete (global as any).PIVOTS;
    vi.restoreAllMocks();
  });

  it('allocates the exact 12x12 Blessed Cartesian grid quadrants', () => {
    expect(Buzz.CONDUCTOR_GRID_LEFT).toEqual({ x: 0, y: 4, xSpan: 4, ySpan: 8 });
    expect(Buzz.CONDUCTOR_GRID_RIGHT).toEqual({ x: 4, y: 0, xSpan: 8, ySpan: 12 });
  });

  it('sanitizes strings to pure 7-bit clean ASCII, stripping multi-byte emojis and smart quotes', () => {
    const raw = 'Bog said: “Tighten the valve!” 🔧 — immediate action.';
    const sanitized = Stream.sanitizeTo7BitAscii(raw);
    expect(sanitized).toBe('Bog said: "Tighten the valve!"  - immediate action.');
    expect(/[\x80-\xFF]/.test(sanitized)).toBe(false);
  });

  it('formats telemetry receipts with correct status tokens', () => {
    const okLine = Stream.formatTelemetryLine('CONDUCTOR', 'System Ready', 'OK');
    expect(okLine).toBe('>> [CONDUCTOR] [OK] System Ready');

    const failLine = Stream.formatTelemetryLine('AUDIO', 'Process Terminated', 'FAIL');
    expect(failLine).toBe(':: [AUDIO] [FAIL] Process Terminated');
  });

  it('degrades gracefully in headless mode when global.LIBRARY is absent', async () => {
    delete (global as any).LIBRARY;
    const bale = {
      idx: 'test-headless',
      slv: (res: any) => res,
    };
    const updated = await Buzz.updateMenu(model, bale, null as any);
    expect(updated).toBeDefined();
  });

  it('dispatches remote action to global.MICROSERVICEAUDIO pivot when available', async () => {
    const mockHunt = vi.fn().mockResolvedValue({ success: true });
    (global as any).MICROSERVICEAUDIO = { hunt: mockHunt };

    const bale = {
      idx: 'test-pivot',
      slv: (res: any) => res,
    };

    const updated = await Buzz.dispatchRemoteAudioPivot(model, bale, null as any);
    expect(mockHunt).toHaveBeenCalledWith(
      '[Microserviceaudio action] Update Microserviceaudio',
      expect.objectContaining({ content: 'Remote Conductor Handshake' }),
    );
    expect(updated).toBeDefined();
  });
});