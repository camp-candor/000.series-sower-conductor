import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sim from '../hunt.js'
import * as ActCanon from '../30.canon.unit/canon.action.js'
import * as ActSqlite from '../08.sqlite.unit/sqlite.action.js'
import {
    canonicalJsonStringify,
    deepFreeze,
    computeCanonMerkleRoot,
} from '../30.canon.unit/buz/canon.buzz.js'
import { BibleState } from '../30.canon.unit/fce/canon.interface.js'

describe('packages/400.conductor 30.canon.unit Deep-Frozen Canon Loader', () => {
    const testSeriesSlug = 'test-series'
    const compiledDir = path.resolve(
        process.cwd(),
        `compiled/${testSeriesSlug}`,
    )
    const biblePath = path.resolve(compiledDir, 'bible-state.json')

    const sampleCanon: BibleState = {
        series_slug: testSeriesSlug,
        canon_merkle_root: '',
        characters: {
            char_bog: { id: 'char_bog', name: 'Bog', role: 'Scavenger' },
            char_silas: { id: 'char_silas', name: 'Silas', role: 'Pilot' },
        },
        environments: {
            env_drain: { id: 'env_drain', title: 'Culvert Siphon' },
        },
        grievances: {},
        props: {},
        compiled_at_ms: 1000,
    }

    beforeEach(() => {
        if (!fs.existsSync(compiledDir)) {
            fs.mkdirSync(compiledDir, { recursive: true })
        }
        const computedRoot = computeCanonMerkleRoot(sampleCanon)
        sampleCanon.canon_merkle_root = computedRoot
        fs.writeFileSync(biblePath, JSON.stringify(sampleCanon, null, 2))
    })

    afterEach(() => {
        if (fs.existsSync(biblePath)) fs.unlinkSync(biblePath)
        if (fs.existsSync(compiledDir)) fs.rmdirSync(compiledDir)
    })

    it('strictly produces deterministic RFC 8785 JSON string regardless of key ordering', () => {
        const objA = { b: 2, a: 1, c: { y: 20, x: 10 } }
        const objB = { c: { x: 10, y: 20 }, a: 1, b: 2 }
        expect(canonicalJsonStringify(objA)).toBe(canonicalJsonStringify(objB))
        expect(canonicalJsonStringify(objA)).toBe(
            '{"a":1,"b":2,"c":{"x":10,"y":20}}',
        )
    })

    it('recursively deep-freezes objects and throws TypeError on mutation in strict mode', () => {
        const raw = { character: { name: 'Silas', stats: { arms: 2 } } }
        const frozen = deepFreeze(raw)

        expect(Object.isFrozen(frozen)).toBe(true)
        expect(Object.isFrozen(frozen.character)).toBe(true)
        expect(Object.isFrozen(frozen.character.stats)).toBe(true)

        expect(() => {
            ;(frozen.character.stats as any).arms = 1
        }).toThrow(TypeError)
    })

    it('loads valid bible-state.json, verifies Merkle root, and freezes state via sim.hunt', async () => {
        const res = await sim.hunt!(ActCanon.LOAD_CANON_AND_FREEZE, {
            src: testSeriesSlug,
        })
        expect(res).toBeDefined()
        expect(res.canonBit.val).toBe(1)
        expect(res.canonBit.src).toBe(sampleCanon.canon_merkle_root)
        expect(Object.isFrozen(res.canonBit.dat)).toBe(true)
    })

    it('negative control: rejects bible-state.json with corrupted Merkle root header', async () => {
        const corruptedCanon = {
            ...sampleCanon,
            canon_merkle_root:
                'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        }
        fs.writeFileSync(biblePath, JSON.stringify(corruptedCanon))

        const res = await sim.hunt!(ActCanon.LOAD_CANON_AND_FREEZE, {
            src: testSeriesSlug,
        })
        expect(res.canonBit.val).toBe(0)
        expect(res.canonBit.src).toContain('MERKLE_ROOT_CORRUPT')
    })

    it('negative control: cross-verifies with pilot.db and rejects hash mismatch', async () => {
        // Open in-memory sqlite db and seed mismatched CANON_MERKLE_ROOT
        const sqliteBit = await sim.hunt!(ActSqlite.OPEN_SQLITE_LEDGER, {
            src: ':memory:',
        })
        const db = sqliteBit.sqliteBit.dat

        db.prepare(
            `
      INSERT INTO facts (fact_id, category, version, content_json, merkle_leaf_hash, updated_at_ms)
      VALUES ('CANON_MERKLE_ROOT', 'CANON', 1, '{}', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 1000)
    `,
        ).run()

        const res = await sim.hunt!(ActCanon.LOAD_CANON_AND_FREEZE, {
            src: testSeriesSlug,
        })
        expect(res.canonBit.val).toBe(0)
        expect(res.canonBit.src).toContain('MERKLE_ROOT_MISMATCH')
    })
})
