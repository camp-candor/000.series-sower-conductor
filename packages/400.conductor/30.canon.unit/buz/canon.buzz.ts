import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { CanonModel } from '../canon.model.js'
import CanonBit from '../fce/canon.bit.js'
import { BibleState } from '../fce/canon.interface.js'
import State from '../../99.core/state.js'
import { getSqliteInstance } from '../../08.sqlite.unit/buz/sqlite.buzz.js'

export const canonicalJsonStringify = (obj: unknown): string => {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj)
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(canonicalJsonStringify).join(',') + ']'
    }
    const keys = Object.keys(obj as Record<string, unknown>).sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0,
    )
    return (
        '{' +
        keys
            .map(
                (k) =>
                    JSON.stringify(k) +
                    ':' +
                    canonicalJsonStringify((obj as Record<string, unknown>)[k]),
            )
            .join(',') +
        '}'
    )
}

export const deepFreeze = <T>(obj: T): Readonly<T> => {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    Object.freeze(obj)
    for (const key of Object.getOwnPropertyNames(obj)) {
        const val = (obj as Record<string, unknown>)[key]
        if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
            deepFreeze(val)
        }
    }
    return obj as Readonly<T>
}

export const computeCanonMerkleRoot = (parsed: BibleState): string => {
    const canonBody = {
        characters: parsed.characters,
        environments: parsed.environments,
        grievances: parsed.grievances,
        props: parsed.props,
        series_slug: parsed.series_slug,
    }
    const canonicalString = canonicalJsonStringify(canonBody)
    return crypto
        .createHash('sha256')
        .update(canonicalString, 'utf8')
        .digest('hex')
}

export const initCanon = (cpy: CanonModel, bal: CanonBit, _ste: State) => {
    if (bal.slv) bal.slv({ canonBit: { idx: 'init-canon', val: 1 } })
    return cpy
}

export const loadCanonAndFreeze = (
    cpy: CanonModel,
    bal: CanonBit,
    _ste: State,
) => {
    const seriesSlug = bal.src || 'wiregrass-basin'
    const filePath = path.resolve(
        process.cwd(),
        `compiled/${seriesSlug}/bible-state.json`,
    )

    if (!fs.existsSync(filePath)) {
        const errMsg = `CANON_FILE_MISSING: Path does not exist: ${filePath}`
        process.stderr.write(`>> [CANON] [FAIL] ${errMsg}\n`)
        if (bal.slv)
            bal.slv({
                canonBit: { idx: 'load-canon-error', val: 0, src: errMsg },
            })
        return cpy
    }

    const rawBytes = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(rawBytes) as BibleState

    const calculatedRoot = computeCanonMerkleRoot(parsed)

    if (calculatedRoot !== parsed.canon_merkle_root) {
        const errMsg = `MERKLE_ROOT_CORRUPT: Header ${parsed.canon_merkle_root} != Calculated ${calculatedRoot}`
        process.stderr.write(`>> [CANON] [FAIL] ${errMsg}\n`)
        if (bal.slv)
            bal.slv({
                canonBit: { idx: 'load-canon-error', val: 0, src: errMsg },
            })
        return cpy
    }

    try {
        const db = getSqliteInstance()
        const rootRecord = db
            .prepare(
                "SELECT merkle_leaf_hash FROM facts WHERE fact_id = 'CANON_MERKLE_ROOT'",
            )
            .get() as { merkle_leaf_hash: string } | undefined

        if (rootRecord && rootRecord.merkle_leaf_hash !== calculatedRoot) {
            const errMsg = `MERKLE_ROOT_MISMATCH: pilot.db (${rootRecord.merkle_leaf_hash}) != Calculated (${calculatedRoot})`
            process.stderr.write(`>> [CANON] [FAIL] ${errMsg}\n`)
            if (bal.slv)
                bal.slv({
                    canonBit: { idx: 'load-canon-error', val: 0, src: errMsg },
                })
            return cpy
        }
    } catch (err: any) {
        if (err.message?.includes('MERKLE_ROOT_MISMATCH')) {
            if (bal.slv)
                bal.slv({
                    canonBit: {
                        idx: 'load-canon-error',
                        val: 0,
                        src: err.message,
                    },
                })
            return cpy
        }
        process.stdout.write(
            '>> [CANON] [WARN] pilot.db CANON_MERKLE_ROOT check skipped (ledger uninitialized).\n',
        )
    }

    const frozen = deepFreeze(parsed)
    cpy.activeSeriesSlug = seriesSlug
    cpy.activeMerkleRoot = calculatedRoot
    cpy.isFrozen = true
    cpy.activeCanon = frozen

    process.stdout.write(
        `>> [CANON] [OK] Bible verified and frozen. Merkle Root: ${calculatedRoot}\n`,
    )

    if (bal.slv) {
        bal.slv({
            canonBit: {
                idx: 'load-canon-and-freeze',
                val: 1,
                src: calculatedRoot,
                dat: frozen,
            },
        })
    }
    return cpy
}
