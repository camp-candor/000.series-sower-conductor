import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { compileAutoScriptDirectoryPipeline } from '../16.pipeline.unit/buz/pipeline.buzz.js'
import { sealEpisodeStackReceipt } from '../13.receipt.unit/buz/receipt.buzz.js'
import { verifyConductorStackReplayEquivalence } from '../16.pipeline.unit/buz/pipeline.buzz.js'

const makeScene = (
    date: string,
    time: string,
    cue: string,
    line: string,
) => `Title: Stack Pilot
Credit: Test
Author: Engine 300
Series: wiregrass-basin
Scene: test_scene
Date: ${date}
Start-Time: ${time}
Timecode: ${time}:00:00
Daypart: NIGHT

INT. DINER - NIGHT

Rain hammers tin roof above empty booths.

${cue}
(whispers)
${line}

CUT TO:
`

const seedDir = (dir: string) => {
    fs.writeFileSync(
        path.join(dir, '0001_tick01.fountain'),
        makeScene(
            '2026-10-31',
            '21:00',
            'JOHNNY',
            'Miss Beverly, do you copy?',
        ),
        'utf8',
    )
    fs.writeFileSync(
        path.join(dir, '0002_tick02.fountain'),
        makeScene('2026-10-31', '21:15', 'ORBIE', 'I copy loud plus clear.'),
        'utf8',
    )
}

describe('Batch Manifest Replay Seal', () => {
    let dirA: string
    let dirB: string

    beforeEach(() => {
        dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'replay-a-'))
        dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'replay-b-'))
        seedDir(dirA)
        seedDir(dirB)
    })

    afterEach(() => {
        fs.rmSync(dirA, { recursive: true, force: true })
        fs.rmSync(dirB, { recursive: true, force: true })
    })

    it('yields identical SHA-256 across replay directories', () => {
        const manifestA = compileAutoScriptDirectoryPipeline(dirA)
        const manifestB = compileAutoScriptDirectoryPipeline(dirB)
        const receiptA = sealEpisodeStackReceipt(manifestA)
        const receiptB = sealEpisodeStackReceipt(manifestB)
        expect(receiptA.manifest_sha256).toBe(receiptB.manifest_sha256)
        expect(receiptA.manifest_sha256).toMatch(/^[0-9a-f]{64}$/)
        expect(receiptA.all_six_categories_verified).toBe(true)
        expect(Object.isFrozen(receiptA)).toBe(true)
        const equiv = verifyConductorStackReplayEquivalence(dirA, dirB)
        expect(equiv.equivalent).toBe(true)
        expect(equiv.digestA).toBe(equiv.digestB)
        expect(equiv.mismatches).toEqual([])
    })

    it('detects single-word dialogue divergence', () => {
        const before = verifyConductorStackReplayEquivalence(dirA, dirB)
        expect(before.equivalent).toBe(true)
        fs.writeFileSync(
            path.join(dirB, '0002_tick02.fountain'),
            makeScene(
                '2026-10-31',
                '21:15',
                'ORBIE',
                'I copy silent plus clear.',
            ),
            'utf8',
        )
        const after = verifyConductorStackReplayEquivalence(dirA, dirB)
        expect(after.equivalent).toBe(false)
        expect(after.digestA).not.toBe(after.digestB)
        expect(after.mismatches.length).toBeGreaterThan(0)
    })

    it('detects single-word parenthetical divergence and flags exact mutated scene', () => {
        const before = verifyConductorStackReplayEquivalence(dirA, dirB)
        expect(before.equivalent).toBe(true)
        const mutated = makeScene(
            '2026-10-31',
            '21:15',
            'ORBIE',
            'I copy loud plus clear.',
        ).replace('(whispers)', '(shouts)')
        fs.writeFileSync(
            path.join(dirB, '0002_tick02.fountain'),
            mutated,
            'utf8',
        )
        const after = verifyConductorStackReplayEquivalence(dirA, dirB)
        expect(after.equivalent).toBe(false)
        expect(after.digestA).not.toBe(after.digestB)
        expect(
            after.mismatches.some((m) => m.includes('0002_tick02.fountain')),
        ).toBe(true)
    })
})
