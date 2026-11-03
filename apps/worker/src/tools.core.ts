import type { AgentTool } from '@funtuantw/pi-agent-cf'
import { Type, type Static } from '@sinclair/typebox';
import type { Env } from './index.js'

// ============================================================================
// [ SERIES-SOWER-CONDUCTOR: EDGE TOOLS (PURGED CORE) ]
// ============================================================================

export const GetIsolateStatusParams = Type.Object(
  {},
  { additionalProperties: false }
);

export type GetIsolateStatusInput = Static<typeof GetIsolateStatusParams>;

/**
 * Read-only status diagnostic tool for edge isolate surveillance.
 * All Git mutations (create_ephemeral_branch, write_repo_file, create_pull_request)
 * and branch shields are permanently excised.
 */
export const createGetIsolateStatusTool = (env: Env): AgentTool<typeof GetIsolateStatusParams> => ({
  name: 'get_isolate_status',
  label: 'Get Isolate Status',
  description: 'Inspects edge memory, execution metrics, and isolate status.',
  parameters: GetIsolateStatusParams,
  execute: async (_id: any, _args: Static<typeof GetIsolateStatusParams>) => {
    const details = {
      status: 'ONLINE',
      service: 'series-sower-conductor-edge',
      timestamp: Date.now(),
      hasCanonDb: Boolean(env?.CANON_DB),
      authority: 'READ_ONLY_EDGE'
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(details) }],
      details
    };
  }
});

/**
 * Permitted edge tools registry.
 * Git mutation capabilities are strictly forbidden in Cloudflare isolates.
 */
export const coreTools = (env: Env): AgentTool<any>[] => [
  createGetIsolateStatusTool(env)
];
