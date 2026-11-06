import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { synthesizeStaticCompositionTsx } from '../35.remotion.unit/buz/remotion.buzz.js'
import { stampStaticComposition } from '../35.remotion.unit/buz/stampComposition.buzz.js'
import { updateMenu, initMenu } from '../98.menu.unit/buz/00.menu.buzz.js'

describe('Parallax Audio-Only Bake & Blessed Cockpit Integration', () => {
    const dummySceneId = 'ep01_sc01'
    const dummyShots = [
        {
            shotId: 'sh01',
            fromFrame: 0,
            deliveryFrames: 100,
            durationFrames: 100,
            speakerId: 'char_a',
            characterId: 'char_a',
            dialogueText: 'Hello',
            audioWavPath: 'audio/dialogue/sh01.wav',
            videoPlatePath: 'video/sh01.mp4',
            bgMattePath: 'bg/sh01.jpg',
        }
    ]
    const dummyFoleyClips = [
        {
            clipId: 'foley_01',
            foleyPath: 'audio/foley/footsteps.wav',
            fromFrame: 10,
            durationInFrames: 20,
            volumeLinear: 0.8
        }
    ]
    const draftsDir = path.resolve(process.cwd().endsWith('400.conductor') ? process.cwd() : path.resolve(process.cwd(), 'packages/400.conductor'), '35.remotion.unit/drafts')
    const targetPath = path.join(draftsDir, `Master_${dummySceneId}.tsx`)
    const candidatePath = path.join(draftsDir, `Master_${dummySceneId}.candidate.tsx`)

    beforeEach(() => {
        if (!fs.existsSync(draftsDir)) {
            fs.mkdirSync(draftsDir, { recursive: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath)
        if (fs.existsSync(candidatePath)) fs.unlinkSync(candidatePath)
    })

    it('synthesizeStaticCompositionTsx emits pure audio multitrack rig and zero visual plates with audioOnly: true', () => {
        const tsx = synthesizeStaticCompositionTsx(dummySceneId, 100, dummyShots as any, {}, undefined, true)
        expect(tsx).not.toContain('OffthreadVideo')
        expect(tsx).not.toContain('GoblinPuppet')
        expect(tsx).not.toContain('CameraWrapper')
        expect(tsx).not.toContain('<Img')
        expect(tsx).toContain('<Sequence')
        expect(tsx).toContain('<Audio')
        expect(tsx).toMatch(/from=\{0\}/)
        expect(tsx).toMatch(/durationInFrames=\{100\}/)
    })

    it('stampStaticComposition emits 3 tracks, clobber refusal, and zero visuals with audioOnly: true', async () => {
        const result = await stampStaticComposition(dummySceneId, dummyShots as any, {
            audioOnly: true,
            outputDirectory: draftsDir,
            foleyClips: dummyFoleyClips
        })
        expect(result.ok).toBe(true)
        expect(fs.existsSync(targetPath)).toBe(true)
        const tsx = fs.readFileSync(targetPath, 'utf8')

        expect(tsx).not.toContain('CameraWrapper')
        expect(tsx).toContain('<Audio')
        expect(tsx).toContain(`src={staticFile('audio/foley/footsteps.wav')}`)
        expect(tsx).toContain(`src={staticFile('audio/dialogue/sh01.wav')}`)
        expect(tsx).toMatch(/@lifecycle: generated/)

        // Test clobber refusal
        fs.writeFileSync(targetPath, '// @lifecycle: locked\n' + tsx)
        const lockedResult = await stampStaticComposition(dummySceneId, dummyShots as any, {
            audioOnly: true,
            outputDirectory: draftsDir,
            foleyClips: dummyFoleyClips
        })

        expect(lockedResult.wasClobberRefused).toBe(true)
        expect(lockedResult.destinationPath).toBe(candidatePath)
        expect(fs.existsSync(candidatePath)).toBe(true)
        const candidateTsx = fs.readFileSync(candidatePath, 'utf8')
        expect(candidateTsx).toMatch(/@lifecycle: candidate/)
    })

    it('Blessed Cockpit Menu Integration handles RUN PARALLAX DINNER AUDIO-FIRST PIPELINE', async () => {
        const mockGlobal = {
            LIBRARY: {
                hunt: vi.fn().mockImplementation(async (action, payload) => {
                    if (action === '[Grid action] Update Grid') return { grdBit: { dat: {} } }
                    if (action === '[Open action] Open Choice') return { chcBit: { src: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE' } }
                    return {}
                })
            }
        }
        global.LIBRARY = mockGlobal.LIBRARY as any

        const mockSte = {
            hunt: vi.fn().mockResolvedValue({})
        }

        const spyStdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

        const cpy: any = {}
        initMenu(cpy, {} as any, mockSte as any)

        await updateMenu(cpy, {} as any, mockSte as any)


        expect(mockSte.hunt).toHaveBeenCalledWith('[Abstractsyntaxtree action] Parse Scene AST', expect.any(Object))
        expect(mockGlobal.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({ src: expect.stringContaining('>> [PARALLAX:AST]') }))
        expect(mockGlobal.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({ src: expect.stringContaining('>> [PARALLAX:CLOCK]') }))
        expect(mockGlobal.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({ src: expect.stringContaining('>> [PARALLAX:BAKE]') }))

        spyStdout.mockRestore()
    })
})
