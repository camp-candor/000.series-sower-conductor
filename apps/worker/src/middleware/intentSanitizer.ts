import { Context, Next } from 'hono'

const FORBIDDEN_COMMAND_KEYS = [
    'executeRawSql',
    'rawSql',
    'forceStateOverwrite',
    'bypassContinuity',
    'grantPrivilege',
    'dropTable',
    'truncateTable',
    'gitPushOverride',
    'sshKeyInject',
]

export async function intentSanitizer(c: Context, next: Next) {
    if (c.req.method !== 'POST' && c.req.method !== 'PUT') {
        return next()
    }

    try {
        const cloned = c.req.raw.clone()
        const body = await cloned.json()

        if (body && typeof body === 'object') {
            for (const forbiddenKey of FORBIDDEN_COMMAND_KEYS) {
                if (forbiddenKey in body) {
                    return c.json(
                        {
                            ok: false,
                            error: {
                                code: 'FORBIDDEN_COMMAND_INJECTION',
                                message: `The 'Intents, Never Commands' policy prohibits key: ${forbiddenKey}`,
                                prohibitedKey: forbiddenKey,
                            },
                        },
                        403,
                    )
                }
            }
        }

        return next()
    } catch {
        // Not valid JSON body, pass to downstream handler for standard schema rejection
        return next()
    }
}
