import { Type, type Static } from '@sinclair/typebox'
import type { AgentEnv, AgentTool } from '@funtuantw/pi-agent-cf'

export interface Env extends AgentEnv {
    CLOUDFLARE_ACCOUNT_ID: string
    CLOUDFLARE_API_TOKEN: string
    CLOUDFLARE_AI_GATEWAY: string
    CLOUDFLARE_AI_GATEWAY_TOKEN?: string
    GITHUB_TOKEN: string
    GITHUB_DEFAULT_OWNER?: string
    AI: any
}

// ============================================================================
// [ SERIES-SOWER-CONDUCTOR: EDGE TOOLS (PURGED CORE) ]
// ============================================================================

export const GetIsolateStatusParams = Type.Object(
    {},
    { additionalProperties: false },
)

export type GetIsolateStatusInput = Static<typeof GetIsolateStatusParams>

/**
 * Read-only status diagnostic tool for edge isolate surveillance.
 * All Git mutations and branch shields are permanently excised.
 */
export const createGetIsolateStatusTool = (): AgentTool<
    typeof GetIsolateStatusParams
> => ({
    name: 'get_isolate_status',
    label: 'Get Isolate Status',
    description: 'Inspects edge memory, execution metrics, and isolate status.',
    parameters: GetIsolateStatusParams,
    execute: async (_id: string, _args: Record<string, unknown>, env?: any) => {
        return {
            content: [{ type: 'text', text: 'Status retrieved' }],
            details: {
                status: 'ONLINE',
                service: 'series-sower-conductor-edge',
                timestamp: Date.now(),
                hasCanonDb: Boolean(env?.CANON_DB),
                authority: 'READ_ONLY_EDGE',
            },
        }
    },
})

/**
 * Permitted edge tools registry.
 * Git mutation capabilities are strictly forbidden in Cloudflare isolates.
 */
/**
 * Permitted edge tools registry.
 * Git mutation capabilities are strictly forbidden in Cloudflare isolates.
 */
const isolateStatusTool = createGetIsolateStatusTool()
const coreToolsArray: AgentTool<any>[] = [isolateStatusTool]
const coreToolsFn = (_env?: Env): AgentTool<any>[] => coreToolsArray

export const coreTools = new Proxy(coreToolsFn, {
    get(target, prop, receiver) {
        if (prop in coreToolsArray) {
            const val = (coreToolsArray as any)[prop]
            return typeof val === 'function' ? val.bind(coreToolsArray) : val
        }
        return Reflect.get(target, prop, receiver)
    },
}) as unknown as ((env?: Env) => AgentTool<any>[]) & AgentTool<any>[]
