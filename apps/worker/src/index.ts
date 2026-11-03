import { Hono } from 'hono'
import { createAgentWorker, type AgentEnv } from '@funtuantw/pi-agent-cf'
import { coreTools } from './tools.core.js'
// import { customTools } from './tools.custom.js'

export interface Env extends AgentEnv {
    CLOUDFLARE_ACCOUNT_ID: string
    CLOUDFLARE_API_TOKEN: string
    CLOUDFLARE_AI_GATEWAY: string
    CLOUDFLARE_AI_GATEWAY_TOKEN?: string
    GITHUB_TOKEN: string
    GITHUB_DEFAULT_OWNER?: string
    AI: any
    CANON_DB?: any
}

// ----------------------------------------------------------------------------
// :: DETERMINISTIC LLM & DEVOPS SYSTEM PROMPT
// ----------------------------------------------------------------------------

const cfModel: any = {
    id: '@cf/meta/llama-3.2-3b-instruct',
    api: 'openai-completions',
    provider: 'openai',
    baseUrl: '',
    reasoning: false,
    input: ['text'],
    temperature: 0.1,
    compat: {
        supportsStore: false,
        supportsDeveloperRole: false,
        supportsStrictMode: false,
    },
}

const dynamicWorker = createAgentWorker<Env>({
    systemPrompt: (env) => {
        cfModel.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`

        return `
You are a deterministic edge isolate component executing read-only surveillance.
Your only capability is to run the get_isolate_status tool to report memory and health telemetry.
You cannot mutate repositories or cut branches.
        `.trim()
    },
    model: cfModel,
    tools: (env) => [...coreTools(env)],
    getApiKey: (provider, env) => {
        if (provider === 'openai') return env.CLOUDFLARE_API_TOKEN
        return undefined
    },
})

// ----------------------------------------------------------------------------
// :: HONO ROUTER
// ----------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>()

// Root Health & Verification Endpoint
app.get('/', (c) => c.text('REPO-BOT EDGE CONTROL PLANE IS LIVE'))

// Structured Diagnostics Endpoint (Satisfies packages/100.agent switchboard probe)
app.get('/health', (c) =>
    c.json(
        {
            status: 'healthy',
            service: 'series-sower-conductor-worker',
            timestamp: new Date().toISOString(),
            hasGithubToken: Boolean(c.env.GITHUB_TOKEN),
            aiGateway: c.env.CLOUDFLARE_AI_GATEWAY || 'default',
        },
        200,
    ),
)

// Fast-Path Oracle Endpoint
app.get('/oracle', async (c) => {
    try {
        const prompt = c.req.query('prompt') || 'Inspect system status'
        const response = await c.env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
            messages: [
                { role: 'user', content: `${prompt}. Output ONLY raw JSON.` },
            ],
        })
        return c.text(response.response || JSON.stringify(response))
    } catch (error: any) {
        console.error('Oracle Error:', error)
        return c.text(`Error: ${error.message}`, 500)
    }
})

// Durable Object Session Ingress
app.all('/*', async (c) => {
    if (!dynamicWorker.handler.fetch) return c.text('Handler missing', 500)
    return await dynamicWorker.handler.fetch(
        c.req.raw as any,
        c.env,
        c.executionCtx,
    )
})

export const AgentSessionDO = dynamicWorker.AgentSessionDO
export default app
