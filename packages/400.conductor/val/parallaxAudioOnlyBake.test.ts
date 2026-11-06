import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { synthesizeStaticCompositionTsx, stampStaticComposition } from '../35.remotion.unit/buz/remotion.buzz.js'
import { updateMenu } from '../98.menu.unit/buz/00.menu.buzz.js'
import { SceneShotPlan } from '../35.remotion.unit/fce/remotion.interface.js'

describe('Phase 4 Audio-Only Bake & Blessed Switchboard', () => {
    const dummyShots: SceneShotPlan[] = [
        {
            shotIndex: 1,
            durationFrames: 50,
            fromFrame: 0,
            speakerId: 'char_bog',
            dialogueText: 'Hello',
            audioWavPath: 'audio/dialogue/1.wav',
            videoPlatePath: '',
            bgMattePath: ''
        }
    ]

    const dummyFoleyClips = [
        { clipId: 'f1', foleyPath: 'audio/foley/1.wav', fromFrame: 10, durationInFrames: 5, volumeLinear: 0.8 }
    ]

    it('synthesizes pure audio composition lacking visual nodes', () => {
        // We use the actual stampStaticComposition here which wraps the logic
        const sceneId = 'ep01_test_bake'
        const tsx = synthesizeStaticCompositionTsx(sceneId, 100, [
            { shotId: 'sh01', deliveryFrames: 50, fromFrame: 0, characterId: 'char_bog', dialogueText: '', platePath: '', backgroundPath: '', durationMs: 2000, shotType: 'CU', scaleStart: 1.0, scaleEnd: 1.1, focalLength: 35, zoomType: 'SLOW_IN' } as any
        ], undefined, undefined, true)

        expect(tsx).toContain('<Sequence from={0} durationInFrames={50}>')
        expect(tsx).toContain('<Audio src={staticFile(')
        expect(tsx).not.toContain('OffthreadVideo')
        expect(tsx).not.toContain('GoblinPuppet')
        expect(tsx).not.toContain('Shot01CameraWrapper')
        expect(tsx).not.toContain('<Img')
    })

    it('refuses clobber on locked file and writes candidate', async () => {
        const sceneId = 'ep01_locked_test'
        const dir = path.resolve(process.cwd(), 'packages/400.conductor/35.remotion.unit/drafts')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

        const targetPath = path.join(dir, `Master_${sceneId}.tsx`)
        fs.writeFileSync(targetPath, '// @lifecycle: locked\n')

        // Not using stampStaticComposition from remotion.buzz (which is just a reducer wrapper)
        // using the one from stampComposition.buzz
        const { stampStaticComposition: stampFunc } = await import('../35.remotion.unit/buz/stampComposition.buzz.js')

        const receipt = await stampFunc(sceneId, dummyShots, { audioOnly: true, foleyClips: dummyFoleyClips })
        expect(receipt.wasClobberRefused).toBe(true)
        expect(receipt.destinationPath.endsWith('.candidate.tsx')).toBe(true)

        // cleanup
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath)
        if (fs.existsSync(receipt.destinationPath)) fs.unlinkSync(receipt.destinationPath)
    })

    it('executes RUN PARALLAX DINNER AUDIO-FIRST PIPELINE cleanly via Blessed Menu', async () => {
        // Mock global LIBRARY for testing telemetry
        const logs: string[] = []
        global.LIBRARY = {
            hunt: async (action: string, bit: any) => {
                if (action === '[Grid action] Update Grid') return { grdBit: { dat: {} } }
                if (action === '[Open action] Open Choice') return { chcBit: { src: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE' } }
                return null
            }
        } as any

        // Also mock streamConsoleTelemetry via console interception or vi.spyOn if imported
        // Since we import the module we can't easily spy unless we mock it, but we can intercept process.stdout

        const cpy: any = { menuChoices: [] }
        const bal: any = { slv: vi.fn() }
        const ste: any = { hunt: vi.fn() }

        // Needs access to file drafts for compiler
        // The AST parity tests expect specific output so it should pass if we call it
        await updateMenu(cpy, bal, ste)

        expect(cpy.activeSelection).toBe('CHOICE_PARALLAX_AUDIO_FIRST')

        // Clean up drafts
        const bakedPath = path.resolve(process.cwd(), 'packages/400.conductor/35.remotion.unit/drafts/Master_ep01_sc01.tsx')
        if (fs.existsSync(bakedPath)) {
            const bakedTsx = fs.readFileSync(bakedPath, 'utf8')
            expect(bakedTsx).toContain('<Sequence from={0} durationInFrames={74}>')
        }
    })
})
