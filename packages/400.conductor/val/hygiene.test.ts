import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('packages/400.conductor Workspace Topology and Specifier Hygiene', () => {
  const packageRoot = path.resolve(process.cwd(), 'packages/400.conductor');

  function getFilesRecursively(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else if (entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it('confirms physical absence of 26.dialogue.unit and presence of 25.dialogue.unit', () => {
    const oldPath = path.resolve(packageRoot, '26.dialogue.unit');
    const newPath = path.resolve(packageRoot, '25.dialogue.unit');
    expect(fs.existsSync(oldPath)).toBe(false);
    expect(fs.existsSync(newPath)).toBe(true);
  });

  it('strictly contains zero  statements across all TypeScript files', () => {
    const tsFiles = getFilesRecursively(packageRoot);
    const offendingFiles: string[] = [];

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (/\bdebugger\b/.test(content)) {
        offendingFiles.push(path.relative(packageRoot, file));
      }
    }

    expect(offendingFiles).toEqual([]);
  });

  it('strictly contains zero extensionless relative imports across unit files', () => {
    const tsFiles = getFilesRecursively(packageRoot);
    const offendingImports: Array<{ file: string; match: string }> = [];

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const importMatch = line.match(/from\s+['"](\.\.?[^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            offendingImports.push({
              file: path.relative(packageRoot, file),
              match: importPath,
            });
          }
        }
      }
    }

    expect(offendingImports).toEqual([]);
  });

  it('guarantees 100% 7-bit ASCII compliance across all unit sources', () => {
    const tsFiles = getFilesRecursively(packageRoot);
    const nonAsciiTokens: Array<{ file: string; line: number; text: string }> = [];

    for (const file of tsFiles) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        // eslint-disable-next-line no-control-regex
        if (/[\u0080-\uFFFF]/.test(line)) {
          nonAsciiTokens.push({
            file: path.relative(packageRoot, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(nonAsciiTokens).toEqual([]);
  });

  it('confirms physical non-existence of packages/400.conductor/src/', () => {
    const srcDir = path.resolve(packageRoot, 'src');
    expect(fs.existsSync(srcDir)).toBe(false);
  });
});
