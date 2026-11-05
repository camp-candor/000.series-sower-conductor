export interface UniversalProvenanceManifest {
    episodeId: string
    sceneId: string
    gitCommitSha: string
    canonMerkleRoot: string
    assetDigests: Record<string, string>
    sealedAtMs: number
    lockfileSha256?: string
}

export interface ProvenanceMintOptions {
    gitCommitSha?: string
    canonMerkleRoot?: string
    baseDir?: string
}

export interface WormEmissionReceipt {
    ok: boolean
    primarySnapshotPath: string
    wormSnapshotPath: string
    primarySha256: string
    wormSha256: string
    identical: boolean
    t0Spend: '$0.00'
    error?: string
}

export interface SettlementDispatchOptions {
    edgeEndpoint?: string
    mockFetch?: typeof fetch
    timeoutMs?: number
}

export interface SettlementDispatchReceipt {
    ok: boolean
    sceneId: string
    lockfileSha256: string
    edgeAcknowledged: boolean
    isDirtyReset: boolean
    compositionStatus: 'SEALED'
    t0Spend: '$0.00'
    error?: string
}
