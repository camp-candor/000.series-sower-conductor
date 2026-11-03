import { describe, it, expect } from 'vitest';
import { coreTools, createGetIsolateStatusTool } from '../../src/tools.core.js';
import type { Env } from '../../src/index.js';

describe('apps/worker tools.core - Purged Edge Surface', () => {
  const mockEnv = { CANON_DB: {} } as Env;

  it('registers only read-only diagnostic tools', () => {
    const tools = coreTools(mockEnv);
    expect(tools).toHaveLength(1);
    expect(tools[0]?.name).toBe('get_isolate_status');
  });

  it('verifies get_isolate_status returns online telemetry', async () => {
    const tool = createGetIsolateStatusTool(mockEnv);
    const result = await tool.execute('id', {});

    expect(result.details.status).toBe('ONLINE');
    expect(result.details.service).toBe('series-sower-conductor-edge');
    expect(result.details.authority).toBe('READ_ONLY_EDGE');
    expect(result.details.hasCanonDb).toBe(true);

    expect(result.content[0].type).toBe('text');
  });

  it('guarantees Git mutators and rollback mechanisms are absent', () => {
    const toolNames = coreTools(mockEnv).map((t) => t.name);
    expect(toolNames).not.toContain('get_commit_sha');
    expect(toolNames).not.toContain('create_ephemeral_branch');
    expect(toolNames).not.toContain('write_repo_file');
    expect(toolNames).not.toContain('create_pull_request');
  });
});
