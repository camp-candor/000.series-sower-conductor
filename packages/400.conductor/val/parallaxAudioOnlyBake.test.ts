import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { synthesizeStaticCompositionTsx } from '../35.remotion.unit/buz/remotion.buzz.js'
import { stampStaticComposition } from '../35.remotion.unit/buz/stampComposition.buzz.js'
import { updateMenu } from '../98.menu.unit/buz/00.menu.buzz.js'

describe('Parallax Audio-Only Bake Suite', () => {
    beforeEach(() => {
        global.LIBRARY = {
            hunt: vi.fn().mockImplementation(async (action, payload) => {
                if (action === '[Open action] Open Choice') return { chcBit: { src: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE' } }
                if (action === '[Grid action] Update Grid') return { grdBit: { dat: {} } }
                return {}
            })
        } as any; /*
            hunt: vi.fn().mockResolvedValue({
                chcBit: { src: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE' },
                lfcBit: { val: 1 },
                */
    })

    it('synthesizes audio-only static composition containing unquoted integer frames and zero visuals', () => {
        const tsx = synthesizeStaticCompositionTsx('ep01_sc01', 100, [], {}, undefined, true)
        expect(tsx).toContain('durationInFrames={100}')
        expect(tsx).toContain('MultiTrackAudioRig')
        expect(tsx).not.toContain('OffthreadVideo')
        expect(tsx).not.toContain('GoblinPuppet')
        expect(tsx).not.toContain('Shot01CameraWrapper')
        expect(tsx).not.toContain('<Img')
    })

    it('stamps composition containing 3-track audio with zero visuals and unquoted integers', async () => {
        const outDir = path.resolve(process.cwd(), 'drafts_test')
        const receipt = await stampStaticComposition('ep01_sc01', [
            { shotIndex: 1, fromFrame: 0, durationFrames: 50 } as any
        ], {
            outputDirectory: outDir,
            audioOnly: true,
            foleyClips: [
                { clipId: '1', foleyPath: 'foley.wav', fromFrame: 10, durationInFrames: 20, volumeLinear: 1.0 }
            ]
        })
        expect(receipt.ok).toBe(true)
        const content = fs.readFileSync(receipt.destinationPath, 'utf8')
        expect(content).toContain('durationInFrames={50}')
        expect(content).toContain('<Audio')
        expect(content).toContain('from={0}')
        expect(content).not.toContain('OffthreadVideo')
        expect(content).not.toContain('GoblinPuppet')
        expect(content).not.toContain('Shot01CameraWrapper')
        expect(content).not.toContain('<Img')
        fs.rmSync(outDir, { recursive: true, force: true })
    })

    it('refuses clobbering locked composition file and writes candidate', async () => {
        const outDir = path.resolve(process.cwd(), 'drafts_test_locked')
        fs.mkdirSync(outDir, { recursive: true })
        const targetFile = path.resolve(outDir, 'Master_ep01_sc01.tsx')
        fs.writeFileSync(targetFile, '// @lifecycle: locked\n')

        const receipt = await stampStaticComposition('ep01_sc01', [], {
            outputDirectory: outDir,
            audioOnly: true
        })
        expect(receipt.wasClobberRefused).toBe(true)
        expect(receipt.lifecycleStatus).toBe('candidate')
        expect(receipt.destinationPath).toContain('candidate.tsx')
        fs.rmSync(outDir, { recursive: true, force: true })
    })

    it('executes RUN PARALLAX DINNER AUDIO-FIRST PIPELINE from menu', async () => {
        const ste = { hunt: vi.fn().mockResolvedValue({}) } as any
        const cpy = { menuChoices: [] } as any
        await updateMenu(cpy, {} as any, ste)

        expect(global.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({
            src: expect.stringContaining('[PARALLAX:AST]')
        }))
        expect(global.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({
            src: expect.stringContaining('[PARALLAX:CLOCK]')
        }))
        expect(global.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({
            src: expect.stringContaining('[PARALLAX:BAKE]')
        }))
        expect(global.LIBRARY.hunt).toHaveBeenCalledWith('[Console action] Update Console', expect.objectContaining({
            src: expect.stringContaining('[PARALLAX:SEALED]')
        }))
    })
})
