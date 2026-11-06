export interface EndpointResolutionReceipt {
    resolvedUrl: string
    sourceTier:
        'SWITCHBOARD' | 'PACKAGE_OVERRIDE' | 'ENV_CONFIG' | 'LOCAL_DEFAULT'
    evaluatedAtMs: number
}

export function resolveCoordinationEndpoint(): EndpointResolutionReceipt {
    const evaluatedAtMs = Date.now()

    // Tier 1: Active switchboard runtime pointer
    const switchboardUrl = (globalThis as any).agentBaseUrl
    if (
        typeof switchboardUrl === 'string' &&
        switchboardUrl.trim().length > 0
    ) {
        return {
            resolvedUrl: switchboardUrl.trim().replace(/\/+$/, ''),
            sourceTier: 'SWITCHBOARD',
            evaluatedAtMs,
        }
    }

    // Tier 2: Isolated test package override
    const packageOverride = (globalThis as any).packageBaseUrl
    if (
        typeof packageOverride === 'string' &&
        packageOverride.trim().length > 0
    ) {
        return {
            resolvedUrl: packageOverride.trim().replace(/\/+$/, ''),
            sourceTier: 'PACKAGE_OVERRIDE',
            evaluatedAtMs,
        }
    }

    // Tier 3: Process environment variable
    const envUrl = process.env.WORKER_URL || process.env.LOCAL_WORKER_URL
    if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
        return {
            resolvedUrl: envUrl.trim().replace(/\/+$/, ''),
            sourceTier: 'ENV_CONFIG',
            evaluatedAtMs,
        }
    }

    // Tier 4: Canonical local loopback default
    return {
        resolvedUrl: 'http://127.0.0.1:8787',
        sourceTier: 'LOCAL_DEFAULT',
        evaluatedAtMs,
    }
}

export function setRuntimeEndpoint(url: string): string {
    const sanitized = url.trim().replace(/\/+$/, '')
    ;(globalThis as any).agentBaseUrl = sanitized
    process.stdout.write(
        `>> [RESOLVER] [OK] Runtime switchboard set to: ${sanitized}\n`,
    )
    return sanitized
}

export function clearRuntimeEndpoint(): void {
    delete (globalThis as any).agentBaseUrl
    process.stdout.write(
        '>> [RESOLVER] [OK] Runtime switchboard reset to cascade default.\n',
    )
}
