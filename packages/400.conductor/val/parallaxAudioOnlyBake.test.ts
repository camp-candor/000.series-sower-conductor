import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { synthesizeStaticCompositionTsx } from '../35.remotion.unit/buz/remotion.buzz.js'
import { computeCumulativeShotTimings } from '../35.remotion.unit/buz/literalBaking.buzz.js'
import { stampStaticComposition } from '../35.remotion.unit/buz/stampComposition.buzz.js'
import {
    updateMenu,
    choices,
    TOOLTIP_DESCRIPTIONS,
    runParallaxDinnerAudioFirstPipeline,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'

describe('Phase 4: Remotion Audio-Only Source-Baking Flag & Blessed Cockpit Pipeline Trigger', () => {
    let tmpDir: string

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(
            path.join(os.tmpdir(), 'remotion-audio-only-test-'),
        )
    })

    afterEach(() => {
        delete (global as any).LIBRARY
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true })
        }
        vi.restoreAllMocks()
    })

    it('synthesizeStaticCompositionTsx emits strictly audio tracks with unquoted integer literals and zero visual plates', () => {
        const rawShots = [
            {
                shotId: 'sh01',
                characterId: 'char_johnny',
                dialogueText: 'Doctor Mayhaw.',
                platePath: 'plates/unused.mp4',
                backgroundPath: 'mattes/unused.png',
                durationMs: 3000,
            },
        ]
        const shots = computeCumulativeShotTimings(rawShots)

        const tsx = synthesizeStaticCompositionTsx(
            'ep01_sc01',
            shots[0].deliveryFrames,
            shots,
            undefined,
            undefined,
            true,
        )

        // Zero visual components
        expect(tsx.includes('OffthreadVideo')).toBe(false)
        expect(tsx.includes('GoblinPuppet')).toBe(false)
        expect(tsx.includes('Shot01CameraWrapper')).toBe(false)
        expect(tsx.includes('<Img')).toBe(false)
        expect(tsx.includes('generateDespillSvgFilter')).toBe(false)

        // MultiTrackAudioRig presence with unquoted frame literals
        expect(tsx).toContain(
            'export const MultiTrackAudioRig_ep01_sc01: React.FC',
        )
        expect(tsx).toContain('<Sequence from={0} durationInFrames={72}>')
        expect(tsx).toContain('src={staticFile("audio/dialogue/sh01.wav")}')
        expect(tsx).toContain('<MultiTrackAudioRig_ep01_sc01 />')
    })

    it('stampStaticComposition in audioOnly mode stamps Track 1, 2, and 3 without visual plates', async () => {
        const receipt = await stampStaticComposition(
            'ep01_sc01',
            [
                {
                    shotIndex: 1,
                    durationFrames: 72,
                    fromFrame: 0,
                    speakerId: 'char_johnny_walkman',
                    dialogueText: 'Doctor Mayhaw. Look at you.',
                    audioWavPath:
                        'outputs/ep01_sc01/stems/ep01_sc01_line_001.wav',
                    videoPlatePath: 'plates/unused.mp4',
                    bgMattePath: 'mattes/unused.png',
                },
            ],
            {
                outputDirectory: tmpDir,
                audioOnly: true,
                ambientLoopPath: 'music/ambient/amb_diner_rain_hum.wav',
                foleyClips: [
                    {
                        clipId: 'foley_rain_squall_1',
                        foleyPath: 'foley/rain_squall/squall_v1.wav',
                        fromFrame: 0,
                        durationInFrames: 24,
                        volumeLinear: 0.85,
                    },
                ],
            },
        )

        expect(receipt.ok).toBe(true)
        expect(receipt.wasClobberRefused).toBe(false)
        expect(receipt.lifecycleStatus).toBe('generated')

        const tsx = fs.readFileSync(receipt.destinationPath, 'utf8')

        // Visual checks
        expect(tsx.includes('OffthreadVideo')).toBe(false)
        expect(tsx.includes('GoblinPuppet')).toBe(false)
        expect(tsx.includes('Shot01CameraWrapper')).toBe(false)
        expect(tsx.includes('<Img')).toBe(false)

        // Audio checks
        expect(tsx).toContain('<Sequence from={0} durationInFrames={72}>')
        expect(tsx).toContain(
            "src={staticFile('outputs/ep01_sc01/stems/ep01_sc01_line_001.wav')}",
        )
        expect(tsx).toContain('<Sequence from={0} durationInFrames={24}>')
        expect(tsx).toContain(
            "src={staticFile('foley/rain_squall/squall_v1.wav')}",
        )
        expect(tsx).toContain(
            "src={staticFile('music/ambient/amb_diner_rain_hum.wav')}",
        )
        expect(tsx).toContain('loop')
    })

    it('refuses to clobber when @lifecycle: locked sentry is present and writes to .candidate.tsx', async () => {
        const lockedFile = path.join(tmpDir, 'Master_ep01_sc01.tsx')
        fs.writeFileSync(
            lockedFile,
            '// @lifecycle: locked\n// human locked\nexport const Master_ep01_sc01 = () => null;\n',
            'utf8',
        )

        const receipt = await stampStaticComposition(
            'ep01_sc01',
            [
                {
                    shotIndex: 1,
                    durationFrames: 72,
                    fromFrame: 0,
                    speakerId: 'char_johnny_walkman',
                    dialogueText: 'Doctor Mayhaw.',
                    audioWavPath: 'outputs/ep01_sc01/stems/sh01.wav',
                    videoPlatePath: 'plates/unused.mp4',
                    bgMattePath: 'mattes/unused.png',
                },
            ],
            {
                outputDirectory: tmpDir,
                audioOnly: true,
            },
        )

        expect(receipt.wasClobberRefused).toBe(true)
        expect(receipt.lifecycleStatus).toBe('candidate')
        expect(receipt.destinationPath).toContain(
            'Master_ep01_sc01.candidate.tsx',
        )
        expect(fs.existsSync(receipt.destinationPath)).toBe(true)

        // Verify locked file was untouched
        const lockedContent = fs.readFileSync(lockedFile, 'utf8')
        expect(lockedContent).toContain('// @lifecycle: locked')
        expect(lockedContent).toContain('// human locked')
    })

    it('mounts RUN PARALLAX DINNER AUDIO-FIRST PIPELINE in choices array and TOOLTIP_DESCRIPTIONS', () => {
        expect(choices).toContain('RUN PARALLAX DINNER AUDIO-FIRST PIPELINE')
        expect(
            TOOLTIP_DESCRIPTIONS['RUN PARALLAX DINNER AUDIO-FIRST PIPELINE'],
        ).toBeDefined()
        expect(
            TOOLTIP_DESCRIPTIONS['RUN PARALLAX DINNER AUDIO-FIRST PIPELINE'],
        ).toContain('Chain AST parity')
    })

    it('dispatches RUN PARALLAX DINNER AUDIO-FIRST PIPELINE through updateMenu and logs pure 7-bit ASCII receipts', async () => {
        const telemetryLogs: string[] = []
        ;(global as any).LIBRARY = {
            hunt: vi.fn().mockImplementation((action: string, payload: any) => {
                if (action === '[Open action] Open Choice') {
                    return Promise.resolve({
                        chcBit: {
                            src: 'RUN PARALLAX DINNER AUDIO-FIRST PIPELINE',
                        },
                    })
                }
                if (action === '[Console action] Update Console') {
                    if (payload?.src) telemetryLogs.push(payload.src)
                    return Promise.resolve({ success: true })
                }
                return Promise.resolve({ grdBit: { dat: {} } })
            }),
        }

        const model = new MenuModel()
        const slv = vi.fn()

        await updateMenu(
            model,
            { idx: 'test-pipeline', slv } as any,
            { hunt: vi.fn() } as any,
        )

        // Verify telemetry receipts logged to console pane
        const receiptsLogged = telemetryLogs.join('\n')
        expect(receiptsLogged).toContain('>> [PARALLAX:AST]')
        expect(receiptsLogged).toContain('>> [PARALLAX:CLOCK]')
        expect(receiptsLogged).toContain('>> [PARALLAX:FOLEY]')
        expect(receiptsLogged).toContain('>> [PARALLAX:BAKE]')
        expect(receiptsLogged).toContain('>> [PARALLAX:SEALED]')

        // Verify pure 7-bit ASCII
        for (const log of telemetryLogs) {
            expect(/[\x80-\xFF]/.test(log)).toBe(false)
        }

        // Verify Master_ep01_sc01.tsx exists on disk and is audio-only
        const packageRoot = process.cwd().endsWith('400.conductor')
            ? process.cwd()
            : path.resolve(process.cwd(), 'packages/400.conductor')
        const masterPath = path.resolve(
            packageRoot,
            '35.remotion.unit/drafts/Master_ep01_sc01.tsx',
        )
        expect(fs.existsSync(masterPath)).toBe(true)

        const masterContent = fs.readFileSync(masterPath, 'utf8')
        expect(masterContent.includes('OffthreadVideo')).toBe(false)
        expect(masterContent.includes('GoblinPuppet')).toBe(false)
        expect(masterContent.includes('Shot01CameraWrapper')).toBe(false)
        expect(masterContent).toContain('amb_diner_rain_hum.wav')

        // Count dialogue sequences (34)
        const dialogueMatches = masterContent.match(
            /Track 1: Dialogue Sequence/g,
        )
        expect(dialogueMatches?.length).toBe(34)

        // Count Foley sequences (9)
        const foleyMatches = masterContent.match(/Track 2: Foley Sequence/g)
        expect(foleyMatches?.length).toBe(9)
    })
})
