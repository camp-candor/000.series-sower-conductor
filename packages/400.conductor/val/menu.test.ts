import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sim from '../hunt.js';
import * as ActMnu from '../98.menu.unit/menu.action.js';

describe('packages/400.conductor 98.menu.unit Phase 7 Edge Flight Deck Integration', () => {
  it('strictly contains zero src/ directory in packages/400.conductor', () => {
    const srcPath = path.resolve(process.cwd().endsWith('400.conductor') ? process.cwd() : path.join(process.cwd(), 'packages/400.conductor'), 'src');
    expect(fs.existsSync(srcPath)).toBe(false);
  });

  it('initializes menu state cleanly in headless environment', async () => {
    const res = await sim.hunt!(ActMnu.INIT_MENU, {});
    expect(res).toBeDefined();
    expect(res.menuBit.val).toBe(1);
    expect(res.menuBit.idx).toBe('init-menu');
  });

  it('exposes all edge bridge and Remotion options in choice list', async () => {
    const res = await sim.hunt!(ActMnu.UPDATE_MENU, {
      src: 'PING EDGE COORDINATOR HEALTH',
    });
    expect(res).toBeDefined();
    expect(res.menuBit.val).toBe(1);
    expect(res.menuBit.src).toBe('PING EDGE COORDINATOR HEALTH');

    const list = res.menuBit.lst;
    expect(list).toContain('PING EDGE COORDINATOR HEALTH');
    expect(list).toContain('TOGGLE EDGE ENDPOINT (LOCAL/CLOUD)');
    expect(list).toContain('ACQUIRE HARDWARE LEASE (RIG 2)');
    expect(list).toContain('AUDIT CANON D1 STALENESS GATE');
    expect(list).toContain('TRANSMIT ASSEMBLY RECEIPT TO EDGE');
    expect(list).toContain('STAMP STATIC REMOTION TSX (ep01)');
    expect(list).toContain('AUDIT REMOTION COMPOSITION AST');
    expect(list).toContain('SEAL UNIVERSAL PROVENANCE LOCKFILE');
  });

  it('dispatches TOGGLE_EDGE_MENU action cleanly', async () => {
    const res = await sim.hunt!(ActMnu.TOGGLE_EDGE_MENU, {});
    expect(res).toBeDefined();
    expect(res.menuBit.src).toBe('TOGGLE EDGE ENDPOINT (LOCAL/CLOUD)');
  });

  it('dispatches LEASE_EDGE_MENU action cleanly', async () => {
    const res = await sim.hunt!(ActMnu.LEASE_EDGE_MENU, {});
    expect(res).toBeDefined();
    expect(res.menuBit.src).toBe('ACQUIRE HARDWARE LEASE (RIG 2)');
  });

  it('dispatches STALENESS_EDGE_MENU action cleanly', async () => {
    const res = await sim.hunt!(ActMnu.STALENESS_EDGE_MENU, {});
    expect(res).toBeDefined();
    expect(res.menuBit.src).toBe('AUDIT CANON D1 STALENESS GATE');
  });

  it('dispatches TRANSMIT_EDGE_MENU action cleanly', async () => {
    const res = await sim.hunt!(ActMnu.TRANSMIT_EDGE_MENU, {});
    expect(res).toBeDefined();
    expect(res.menuBit.src).toBe('TRANSMIT ASSEMBLY RECEIPT TO EDGE');
  });

  it('asserts 100% pure 7-bit ASCII compliance across 98.menu.unit', () => {
    const dir = path.resolve(process.cwd().endsWith('400.conductor') ? process.cwd() : path.join(process.cwd(), 'packages/400.conductor'), '98.menu.unit');
    const scanDir = (target: string) => {
      const files = fs.readdirSync(target, { withFileTypes: true });
      for (const f of files) {
        const fullPath = path.join(target, f.name);
        if (f.isDirectory()) {
          scanDir(fullPath);
        } else if (f.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // eslint-disable-next-line no-control-regex
          const match = content.match(/[\u0080-\uFFFF]/);
          expect(match).toBeNull();
        }
      }
    };
    scanDir(dir);
  });
});
