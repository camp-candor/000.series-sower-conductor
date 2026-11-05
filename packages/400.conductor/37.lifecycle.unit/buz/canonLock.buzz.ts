import crypto from 'node:crypto'
import { CanonLockResult } from '../fce/lifecycle.interface.js'

export function deepFreeze<T>(obj: T): Readonly<T> {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    const propNames = Object.getOwnPropertyNames(obj)
    for (const name of propNames) {
        const value = (obj as any)[name]
        if (value && typeof value === 'object') {
            deepFreeze(value)
        }
    }

    return Object.freeze(obj)
}

export function canonicalJsonStringify(obj: unknown): string {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj)
    }

    if (Array.isArray(obj)) {
        return (
            '[' +
            obj.map((item) => canonicalJsonStringify(item)).join(',') +
            ']'
        )
    }

    const sortedKeys = Object.keys(obj as Record<string, unknown>).sort()
    const entries: string[] = []

    for (const key of sortedKeys) {
        const val = (obj as Record<string, unknown>)[key]
        if (val !== undefined) {
            entries.push(
                JSON.stringify(key) + ':' + canonicalJsonStringify(val),
            )
        }
    }

    return '{' + entries.join(',') + '}'
}

export function verifyCanonMerkleLock(
    canonState: unknown,
    expectedMerkleRoot: string,
): CanonLockResult {
    // 1. Recursive Immutability Lock
    deepFreeze(canonState)

    // 2. Deterministic Hash Minting
    const canonicalString = canonicalJsonStringify(canonState)
    const calculatedMerkleRoot = crypto
        .createHash('sha256')
        .update(canonicalString)
        .digest('hex')

    const valid =
        calculatedMerkleRoot.toLowerCase() === expectedMerkleRoot.toLowerCase()

    return {
        valid,
        calculatedMerkleRoot,
        expectedMerkleRoot,
        diverged: !valid,
    }
}
