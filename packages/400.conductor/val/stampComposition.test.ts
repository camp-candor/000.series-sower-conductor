import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { stampStaticComposition } from '../35.remotion.unit/buz/stampComposition.buzz.js'
import { SceneShotPlan } from '../35.remotion.unit/fce/remotion.interface.js'

describe('packages/400.conductor Phase 7 Static Metaprogram React TSX Stamping', () => {
    const packageRoot = process.cwd().endsWith('400.conductor')
        ? process.cwd()
        : path.resolve(process.cwd(), 'packages/400.conductor')
    const scratchDir = path.resolve(packageRoot, 'val/scratch_remotion_test')

    const mockShots: SceneShotPlan[] = [
        {
            shotIndex: 1,
            durationFrames: 75,
            fromFrame: 0,
            speakerId: 'char_elias',
            dialogueText: 'The pressure needle is shivering.',
            audioWavPath: 'takes/elias_sh01_dialogue.wav',
            videoPlatePath: 'takes/elias_sh01.mp4',
            bgMattePath: 'backgrounds/bunker_north.png',
            cameraZoom: { x: 512, y: 384, scaleStart: 1.0, scaleEnd: 1.08 },
        },
        {
            shotIndex: 2,
            durationFrames: 48,
            fromFrame: 75,
            speakerId: 'char_torvin',
            dialogueText: 'Hold the gasket.',
            audioWavPath: 'takes/torvin_sh02_dialogue.wav',
            videoPlatePath: 'takes/torvin_sh02.mp4',
            bgMattePath: 'backgrounds/bunker_south.png',
            cameraZoom: { x: 960, y: 540, scaleStart: 1.0, scaleEnd: 1.0 },
        },
    ]

    beforeEach(() => {
        if (!fs.existsSync(scratchDir)) {
            fs.mkdirSync(scratchDir, { recursive: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(scratchDir)) {
            fs.rmSync(scratchDir, { recursive: true, force: true })
        }
    })

    it('strictly verifies zero src/ directory exists in packages/400.conductor', () => {
        const srcPath = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcPath)).toBe(false)
    })

    it('stamps static TSX composition with raw unquoted numeric literals', async () => {
        const receipt = await stampStaticComposition('ep01_sc01', mockShots, {
            outputDirectory: scratchDir,
            upstreamAstHash: 'a1b2c3d4e5f6',
        })

        expect(receipt.ok).toBe(true)
        expect(receipt.totalFrames).toBe(123)
        expect(receipt.shotCount).toBe(2)
        expect(fs.existsSync(receipt.destinationPath)).toBe(true)

        const emittedCode = fs.readFileSync(receipt.destinationPath, 'utf8')

        // Assert raw unquoted numeric literals
        expect(emittedCode).toContain('durationInFrames={123}')
        expect(emittedCode).toContain('durationInFrames={75}')
        expect(emittedCode).toContain('from={0}')
        expect(emittedCode).toContain('durationInFrames={48}')
        expect(emittedCode).toContain('from={75}')

        // Reject string-coerced props
        expect(emittedCode).not.toContain('durationInFrames="75"')
        expect(emittedCode).not.toContain('durationInFrames={"75"}')
    })

    it('generates dedicated camera wrapper subcomponents for sequence-relative hook isolation', async () => {
        const receipt = await stampStaticComposition('ep01_sc02', mockShots, {
            outputDirectory: scratchDir,
        })

        const code = fs.readFileSync(receipt.destinationPath, 'utf8')
        expect(code).toContain('const Shot01CameraWrapper: React.FC')
        expect(code).toContain('const Shot02CameraWrapper: React.FC')
        expect(code).toContain('<Shot01CameraWrapper>')
        expect(code).toContain('<Shot02CameraWrapper>')
        expect(code).toContain('useCurrentFrame()')
    })

    it('stamps provenance headers with body checksum', async () => {
        const receipt = await stampStaticComposition('ep01_sc03', mockShots, {
            outputDirectory: scratchDir,
            upstreamAstHash: 'fedcba9876543210',
        })

        const code = fs.readFileSync(receipt.destinationPath, 'utf8')
        expect(code).toContain('// @lifecycle: generated')
        expect(code).toContain(`// @checksum: ${receipt.checksumSha256}`)
        expect(code).toContain('// @upstream_ast: sha256:fedcba9876543210')
    })

    it('refuses to clobber @lifecycle: locked files and emits candidate sibling', async () => {
        const targetFile = path.join(scratchDir, 'Master_ep01_sc04.tsx')
        fs.writeFileSync(
            targetFile,
            '// @lifecycle: locked\n// Director custom cut\nexport const Custom = () => null;\n',
        )

        const receipt = await stampStaticComposition('ep01_sc04', mockShots, {
            outputDirectory: scratchDir,
        })

        expect(receipt.wasClobberRefused).toBe(true)
        expect(receipt.lifecycleStatus).toBe('candidate')
        expect(receipt.destinationPath).toContain(
            'Master_ep01_sc04.candidate.tsx',
        )

        // Assert original locked file was preserved
        const originalContent = fs.readFileSync(targetFile, 'utf8')
        expect(originalContent).toContain('// @lifecycle: locked')
        expect(originalContent).toContain('Director custom cut')
    })

    it('asserts 100% pure 7-bit ASCII compliance across 35.remotion.unit', () => {
        const dir = path.resolve(packageRoot, '35.remotion.unit')
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
