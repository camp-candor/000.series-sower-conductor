import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { verifyLocalContinuity } from '../37.lifecycle.unit/buz/preflightContinuity.buzz.js'
import { evaluateSomaticCapability } from '../37.lifecycle.unit/buz/somaticCapability.buzz.js'
import {
    verifyCanonMerkleLock,
    deepFreeze,
} from '../37.lifecycle.unit/buz/canonLock.buzz.js'

describe('packages/400.conductor Phase 1 Local Inception Preflight Verification', () => {
    let db: any
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')

    beforeEach(() => {
        db = new Database(':memory:')
        db.exec(`
      CREATE TABLE scenes (
        id TEXT PRIMARY KEY,
        is_dirty INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE facts (
        id TEXT PRIMARY KEY,
        version INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE scene_fact_dependencies (
        scene_id TEXT NOT NULL,
        fact_id TEXT NOT NULL,
        pinned_version INTEGER NOT NULL,
        PRIMARY KEY (scene_id, fact_id)
      );
    `)
    })

    afterEach(() => {
        if (db) db.close()
    })

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('passes continuity check cleanly when scene has 0 dirty dependencies', async () => {
        db.prepare(
            "INSERT INTO scenes (id, is_dirty) VALUES ('ep01_sc01', 0)",
        ).run()
        db.prepare(
            "INSERT INTO facts (id, version) VALUES ('fact_weather', 2)",
        ).run()
        db.prepare(
            "INSERT INTO scene_fact_dependencies (scene_id, fact_id, pinned_version) VALUES ('ep01_sc01', 'fact_weather', 2)",
        ).run()

        const res = await verifyLocalContinuity('ep01_sc01', db)
        expect(res.clean).toBe(true)
        expect(res.dirtyCount).toBe(0)
        expect(res.totalDependencies).toBe(1)
        expect(res.latencyMs).toBeLessThan(50)
    })

    it('fails closed when an upstream fact version exceeds pinned version', async () => {
        db.prepare(
            "INSERT INTO scenes (id, is_dirty) VALUES ('ep01_sc02', 0)",
        ).run()
        db.prepare(
            "INSERT INTO facts (id, version) VALUES ('fact_bunker_power', 3)",
        ).run()
        db.prepare(
            "INSERT INTO scene_fact_dependencies (scene_id, fact_id, pinned_version) VALUES ('ep01_sc02', 'fact_bunker_power', 2)",
        ).run()

        const res = await verifyLocalContinuity('ep01_sc02', db)
        expect(res.clean).toBe(false)
        expect(res.dirtyCount).toBe(1)
        expect(res.reason).toContain('DIRTY_SCENE_REJECTED')
    })

    it('fails closed when scene row is explicitly marked is_dirty = 1', async () => {
        db.prepare(
            "INSERT INTO scenes (id, is_dirty) VALUES ('ep01_sc03', 1)",
        ).run()

        const res = await verifyLocalContinuity('ep01_sc03', db)
        expect(res.clean).toBe(false)
        expect(res.reason).toContain('DIRTY_SCENE_REJECTED')
    })

    it('rejects character action verbs that violate somatic capability masks', () => {
        const cast = [
            {
                characterId: 'char_elias',
                functionalLimbs: 1,
                bannedKineticVerbs: ['heavy_lift', 'sprint'],
            },
        ]

        const actions = {
            char_elias: ['walk', 'heavy_lift'],
        }

        const res = evaluateSomaticCapability(cast, actions)
        expect(res.valid).toBe(false)
        expect(res.violatingCharacters).toContain('char_elias')
        expect(res.reasons[0]).toContain('SOMATIC_CAPABILITY_BREACH')
    })

    it('rejects two-handed actions when character possesses fewer than 2 functional limbs', () => {
        const cast = [
            {
                characterId: 'char_torvin',
                functionalLimbs: 1,
                bannedKineticVerbs: [],
            },
        ]

        const actions = {
            char_torvin: ['climb_ladder'],
        }

        const res = evaluateSomaticCapability(cast, actions)
        expect(res.valid).toBe(false)
        expect(res.violatingCharacters).toContain('char_torvin')
        expect(res.reasons[0]).toContain('LIMB_CAPACITY_BREACH')
    })

    it('verifies deep-frozen canon state and catches Merkle root drift', () => {
        const canonState = {
            world: 'bunker_district_04',
            laws: ['no_outside_air', 'curfew_2200'],
            version: 1,
        }

        // Calculate valid hash first
        const lockCheck = verifyCanonMerkleLock(
            canonState,
            '0000000000000000000000000000000000000000000000000000000000000000',
        )
        expect(lockCheck.valid).toBe(false)
        expect(lockCheck.diverged).toBe(true)

        const validHash = lockCheck.calculatedMerkleRoot
        const secondCheck = verifyCanonMerkleLock(canonState, validHash)
        expect(secondCheck.valid).toBe(true)
        expect(secondCheck.diverged).toBe(false)
    })

    it('asserts Object.freeze prevents runtime mutation of deep-frozen state', () => {
        const state = { rule: 'immutable', nested: { val: 42 } }
        deepFreeze(state)

        expect(() => {
            ;(state as any).rule = 'mutated'
        }).toThrow(TypeError)

        expect(() => {
            ;(state as any).nested.val = 99
        }).toThrow(TypeError)
    })

    it('asserts 100% pure 7-bit ASCII compliance across 37.lifecycle.unit', () => {
        const dir = path.resolve(packageRoot, '37.lifecycle.unit')
        const scanDir = (target: string) => {
            const entries = fs.readdirSync(target, { withFileTypes: true })
            for (const entry of entries) {
                const full = path.join(target, entry.name)
                if (entry.isDirectory()) {
                    scanDir(full)
                } else if (entry.name.endsWith('.ts')) {
                    const content = fs.readFileSync(full, 'utf8')
                    // eslint-disable-next-line no-control-regex
                    const match = content.match(/[\u0080-\uFFFF]/)
                    expect(match).toBeNull()
                }
            }
        }
        scanDir(dir)
    })
})
