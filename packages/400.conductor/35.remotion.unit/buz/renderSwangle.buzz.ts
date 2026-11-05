import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {
  SwangleRenderOptions,
  SwangleRenderReceipt,
} from '../fce/renderOptions.interface.js';
import { buildSwangleCliArgs } from './swangleCliBuilder.buzz.js';

export async function spawnSwangleRenderProcess(
  options: SwangleRenderOptions,
  spawnFunction: typeof spawn = spawn
): Promise<SwangleRenderReceipt> {
  const startTime = Date.now();
  const timeoutMs = options.timeoutMs ?? 180000;
  const args = buildSwangleCliArgs(options);

  // Ensure output directory exists
  const outDir = path.dirname(path.resolve(process.cwd(), options.outputLocation));
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise<SwangleRenderReceipt>((resolve) => {
    let renderedFrames = 0;
    let totalFrames = options.expectedFrames ?? 0;
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let hasTimedOut = false;

    process.stdout.write(
      `>> [SWANGLE] Spawning headless CPU rasterizer (--gl=swangle, --concurrency=1, 0 MB VRAM)...\n`
    );

    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawnFunction(npxCommand, args, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timeoutHandle = setTimeout(() => {
      hasTimedOut = true;
      process.stderr.write(
        `>> [SWANGLE] [FAIL] Subprocess timed out after ${timeoutMs}ms. Sending SIGKILL...\n`
      );
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString('utf8');
      stdoutBuffer += chunk;

      const lines = chunk.split('\n');
      for (const line of lines) {
        // Parse Remotion progress telemetry: "Rendered X frames (Y%)" or "Rendered X/Y"
        const match = line.match(/Rendered\s+(\d+)(?:\/(\d+)|\s+frames)/i);
        if (match) {
          renderedFrames = parseInt(match[1], 10);
          if (match[2]) {
            totalFrames = parseInt(match[2], 10);
          }
          process.stdout.write(`>> [RENDER-PROGRESS] ${line.trim()}\n`);
        }
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderrBuffer += data.toString('utf8');
    });

    child.on('error', (err: Error) => {
      clearTimeout(timeoutHandle);
      resolve({
        ok: false,
        outputLocation: options.outputLocation,
        totalFrames,
        renderedFrames,
        durationMs: Date.now() - startTime,
        vramUsedMb: 0,
        t4Spend: '$0.00',
        cliCommand: `npx ${args.join(' ')}`,
        exitCode: 1,
        error: `SPAWN_ERROR: ${err.message}`,
      });
    });

    child.on('close', (code: number | null) => {
      clearTimeout(timeoutHandle);
      const durationMs = Date.now() - startTime;
      const isSuccess = code === 0 && !hasTimedOut;

      if (isSuccess) {
        process.stdout.write(
          `>> [SWANGLE] [OK] Subprocess exited with code 0 (${durationMs}ms, 0 MB VRAM).\n`
        );
      } else {
        const errorDetail = hasTimedOut
          ? `EXECUTION_TIMEOUT: Render exceeded ${timeoutMs}ms threshold`
          : `EXIT_CODE_${code}: ${stderrBuffer.slice(-300) || stdoutBuffer.slice(-300) || 'Unknown error'}`;
        process.stderr.write(`>> [SWANGLE] [FAIL] Render failed: ${errorDetail}\n`);
      }

      resolve({
        ok: isSuccess,
        outputLocation: options.outputLocation,
        totalFrames: totalFrames || renderedFrames,
        renderedFrames,
        durationMs,
        vramUsedMb: 0,
        t4Spend: '$0.00',
        cliCommand: `npx ${args.join(' ')}`,
        exitCode: code ?? 1,
        error: isSuccess ? undefined : hasTimedOut ? 'EXECUTION_TIMEOUT' : `EXIT_CODE_${code}`,
      });
    });
  });
}

