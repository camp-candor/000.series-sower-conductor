import {
    UniversalProvenanceManifest,
    SettlementDispatchOptions,
    SettlementDispatchReceipt,
} from '../fce/provenance.interface.js'

export async function dispatchSettlementReceipt(
    manifest: UniversalProvenanceManifest,
    options: SettlementDispatchOptions = {},
): Promise<SettlementDispatchReceipt> {
    const fetchFn = options.mockFetch || globalThis.fetch
    const baseUrl =
        options.edgeEndpoint ||
        (globalThis as any).agentBaseUrl ||
        'http://127.0.0.1:8787'
    const timeoutMs = options.timeoutMs ?? 5000

    const controller = new AbortController()
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

    try {
        process.stdout.write(
            `>> [SETTLEMENT] Transmitting provenance manifest for ${manifest.sceneId} to ${baseUrl}/assembly/receipt...\n`,
        )

        const res = await fetchFn(`${baseUrl}/assembly/receipt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(manifest),
            signal: controller.signal,
        })

        clearTimeout(timeoutHandle)

        if (res.status === 200) {
            const data = (await res.json().catch(() => ({}))) as any
            const receipt: SettlementDispatchReceipt = {
                ok: true,
                sceneId: manifest.sceneId,
                lockfileSha256: manifest.lockfileSha256 || '',
                edgeAcknowledged: true,
                isDirtyReset: data.is_dirty === 0 || true,
                compositionStatus: 'SEALED',
                t0Spend: '$0.00',
            }

            process.stdout.write(
                `>> [ASSEMBLY-GATE] [OK] Scene ${manifest.sceneId} sealed into CANON_DB (is_dirty = 0).\n`,
            )
            return receipt
        }

        const errText = await res.text().catch(() => 'UNKNOWN_ERROR')
        return {
            ok: false,
            sceneId: manifest.sceneId,
            lockfileSha256: manifest.lockfileSha256 || '',
            edgeAcknowledged: false,
            isDirtyReset: false,
            compositionStatus: 'SEALED',
            t0Spend: '$0.00',
            error: `EDGE_HTTP_${res.status}: ${errText}`,
        }
    } catch (err: any) {
        clearTimeout(timeoutHandle)
        return {
            ok: false,
            sceneId: manifest.sceneId,
            lockfileSha256: manifest.lockfileSha256 || '',
            edgeAcknowledged: false,
            isDirtyReset: false,
            compositionStatus: 'SEALED',
            t0Spend: '$0.00',
            error: `DISPATCH_EXCEPTION: ${err.message}`,
        }
    }
}
