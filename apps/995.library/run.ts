import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const isConductorTarget =
  args.includes('--package=400.conductor') ||
  args.includes('-p=400.conductor') ||
  args.includes('400.conductor') ||
  process.env.TARGET_PACKAGE === '400.conductor';

if (isConductorTarget) {
  process.stdout.write('>> [RUNNER] Booting packages/400.conductor flight deck via tsx...\n');
  const conductorRoot = path.resolve(process.cwd(), 'packages/400.conductor');
  const entryPoint = path.join(conductorRoot, 'index.ts');

  const child = spawn('npx', ['tsx', entryPoint], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, TARGET_PACKAGE: '400.conductor' },
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
} else {
  // Default library runner startup logic remains intact
  import('./995.library/index.js').catch((err) => {
    process.stderr.write(`>> [RUNNER] Library startup error: ${err.message}\n`);
    process.exit(1);
  });
}

