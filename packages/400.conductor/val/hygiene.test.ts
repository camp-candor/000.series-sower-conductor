import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 1 Local Conductor Unit Hygiene Normalization', () => {
    const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../');

    it('asserts packages/400.conductor/src/ does not exist', () => {
        const srcPath = path.join(packageRoot, 'src');
        expect(fs.existsSync(srcPath)).toBe(false);
    });

    it('verifies BEE.ts exists and declares all mounted unit exports with .js specifiers', () => {
        const beePath = path.join(packageRoot, 'BEE.ts');
        expect(fs.existsSync(beePath)).toBe(true);

        const content = fs.readFileSync(beePath, 'utf8');
        expect(content).toContain("import TypesUnit from './07.types.unit/types.unit.js';");
        expect(content).toContain("import MasterLifecycleUnit from './37.lifecycle.unit/lifecycle.unit.js';");
        expect(content).toContain("import MenuUnit from './98.menu.unit/menu.unit.js';");
        expect(content).toContain('export const list: Array<any> = [');
        expect(content).toContain('export const reducer: any = {');
        expect(content).toContain('export default class UnitData implements Model');

        // Assert all relative imports in BEE.ts end with .js
        const importLines = content.split('\n').filter((l) => l.trim().startsWith('import '));
        for (const line of importLines) {
            if (line.includes("from './") || line.includes("from '../.js")) {
                expect(line).toMatch(/\.js['"];?$/);
            }
        }
    });

    it('verifies zero statements exist across packages/400.conductor', () => {
        const scanDir = (dir: string): string[] => {
            let files: string[] = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'vault') continue;
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    files = files.concat(scanDir(fullPath));
                } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                    files.push(fullPath);
                }
            }
            return files;
        };

        const tsFiles = scanDir(packageRoot);
        const Violations: string[] = [];

        for (const file of tsFiles) {
            const code = fs.readFileSync(file, 'utf8');
            if (/\bdebugger\b/.test(code)) {
                Violations.push(path.relative(packageRoot, file));
            }
        }

        expect(Violations).toEqual([]);
    });

    it('verifies 100% 7-bit clean ASCII compliance across packages/400.conductor', () => {
        const scanDir = (dir: string): string[] => {
            let files: string[] = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'vault') continue;
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    files = files.concat(scanDir(fullPath));
                } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                    files.push(fullPath);
                }
            }
            return files;
        };

        const tsFiles = scanDir(packageRoot);
        const nonAsciiViolations: string[] = [];
        const nonAsciiRegex = /[\u0080-\uFFFF]/;

        for (const file of tsFiles) {
            const code = fs.readFileSync(file, 'utf8');
            if (nonAsciiRegex.test(code)) {
                nonAsciiViolations.push(path.relative(packageRoot, file));
            }
        }

        expect(nonAsciiViolations).toEqual([]);
    });
});
