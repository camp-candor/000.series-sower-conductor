import type { AgentTool } from '@funtuantw/pi-agent-cf'
// import { Type, type Static } from '@sinclair/typebox'
import type { Env } from './index.js'

// ============================================================================
// :: SOVEREIGN CUSTOM TOOLS REGISTRY (DOWNSTREAM EXTENSION HOOK)
// ============================================================================
// Downstream consumers: register your custom domain tools in this file.
// This file is protected by .gitattributes (merge=ours), ensuring upstream
// template pulls will never overwrite your custom tools.
//
// INVARIANTS:
// 1. All tool parameter schemas MUST declare { additionalProperties: false }.
// 2. Wrap all error returns with redactSecrets(err.message).
// 3. Keep all terminal and log telemetry in pure 7-bit ASCII.
// ============================================================================

export const customTools = (_env: Env): AgentTool<any>[] => [
    // Register custom tool factories here:
]
