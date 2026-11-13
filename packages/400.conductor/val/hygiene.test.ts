import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    HYGIENE_AUDIT_LABEL,
    runHygieneAudit,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'

describe('packages/400.conductor Workspace Topology, Specifier Hygiene', () => {
    // Resolve from this file's location so the battery passes whether vitest
    // runs from the monorepo root or the package directory (test:conductor).
    const packageRoot = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
    )

    function getFilesRecursively(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        let files: string[] = []
        for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === 'dist') continue
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                files = files.concat(getFilesRecursively(fullPath))
            } else if (entry.name.endsWith('.ts')) {
                files.push(fullPath)
            }
        }
        return files
    }

    it('confirms physical absence of 26.dialogue.unit and presence of 25.dialogue.unit', () => {
        const oldPath = path.resolve(packageRoot, '26.dialogue.unit')
        const newPath = path.resolve(packageRoot, '25.dialogue.unit')
        expect(fs.existsSync(oldPath)).toBe(false)
        expect(fs.existsSync(newPath)).toBe(true)
    })

    it('strictly contains zero  statements across all TypeScript files', () => {
        const tsFiles = getFilesRecursively(packageRoot)
        const offendingFiles: string[] = []

        for (const file of tsFiles) {
            const content = fs.readFileSync(file, 'utf8')
            if (/\bdebugger\b/.test(content)) {
                offendingFiles.push(path.relative(packageRoot, file))
            }
        }

        expect(offendingFiles).toEqual([])
    })

    it('strictly contains zero extensionless relative imports across unit files', () => {
        const tsFiles = getFilesRecursively(packageRoot)
        const offendingImports: Array<{ file: string; match: string }> = []

        for (const file of tsFiles) {
            const content = fs.readFileSync(file, 'utf8')
            const lines = content.split('\n')
            for (const line of lines) {
                const importMatch = line.match(/from\s+['"](\.\.?[^'"]+)['"]/)
                if (importMatch) {
                    const importPath = importMatch[1]
                    if (
                        !importPath.endsWith('.js') &&
                        !importPath.endsWith('.json')
                    ) {
                        offendingImports.push({
                            file: path.relative(packageRoot, file),
                            match: importPath,
                        })
                    }
                }
            }
        }

        expect(offendingImports).toEqual([])
    })

    it('guarantees 100% 7-bit ASCII compliance across all unit sources', () => {
        const tsFiles = getFilesRecursively(packageRoot)
        const nonAsciiTokens: Array<{
            file: string
            line: number
            text: string
        }> = []

        for (const file of tsFiles) {
            const lines = fs.readFileSync(file, 'utf8').split('\n')
            lines.forEach((line, index) => {
                // eslint-disable-next-line no-control-regex
                if (/[\u0080-\uFFFF]/.test(line)) {
                    nonAsciiTokens.push({
                        file: path.relative(packageRoot, file),
                        line: index + 1,
                        text: line.trim(),
                    })
                }
            })
        }

        expect(nonAsciiTokens).toEqual([])
    })

    it('confirms physical non-existence of packages/400.conductor/src/', () => {
        const srcDir = path.resolve(packageRoot, 'src')
        expect(fs.existsSync(srcDir)).toBe(false)
    })

    it('isolates 25.dialogue.unit / 25.episode.unit reducers in BEE.ts with all 36 units mounted', () => {
        const beeContent = fs.readFileSync(
            path.resolve(packageRoot, 'BEE.ts'),
            'utf8',
        )
        expect(beeContent).toContain('dialogue: reduceFromDialogue.reducer')
        expect(beeContent).toContain('episode: reduceFromEpisode.reducer')

        const requiredUnits = [
            'TypesUnit',
            'SqliteUnit',
            'SpeechUnit',
            'SomaticdspUnit',
            'TelemetryUnit',
            'SceneUnit',
            'ReceiptUnit',
            'ReactionUnit',
            'PropsUnit',
            'PipelineUnit',
            'NarrativeUnit',
            'MemoryUnit',
            'LogisticsUnit',
            'LifecycleUnit',
            'LedgerUnit',
            'HealthUnit',
            'GrievanceUnit',
            'FrameUnit',
            'DialogueUnit',
            'EpisodeUnit',
            'VramUnit',
            'CudaUnit',
            'CpusUnit',
            'ContinuityUnit',
            'CanonUnit',
            'CameraUnit',
            'AudioUnit',
            'AssetUnit',
            'AbstractsyntaxtreeUnit',
            'RemotionUnit',
            'EdgebridgeUnit',
            'MasterLifecycleUnit',
            'ModelUnit',
            'CollectUnit',
            'MenuUnit',
            'BusUnit',
        ]
        for (const unitName of requiredUnits) {
            expect(beeContent).toContain(unitName)
        }
    })

    it('internalizes synthesizeSpeech HTTP dispatch in 09.speech.unit/buz/speech.buzz.ts', () => {
        const speechBuzz = fs.readFileSync(
            path.resolve(packageRoot, '09.speech.unit/buz/speech.buzz.ts'),
            'utf8',
        )
        expect(speechBuzz).toContain('synthesizeSpeech')
        expect(speechBuzz).toContain('/synthesize')
    })

    it('executes [1] RUN UNIT HYGIENE AUDIT and streams 7-bit ASCII telemetry to cns00', async () => {
        expect(HYGIENE_AUDIT_LABEL).toBe('[1] RUN UNIT HYGIENE AUDIT')
        const consoleLines: string[] = []
        let resolved: any = null

        const mockState = {
            hunt: async (action: string, bale: any) => {
                if (action === '[Console action] Update Console' && bale?.src) {
                    consoleLines.push(bale.src)
                }
                return {}
            },
        } as any

        await runHygieneAudit(
            new MenuModel(),
            {
                idx: 'test-hygiene',
                slv: (res: any) => {
                    resolved = res
                },
            },
            mockState,
        )

        expect(resolved?.mnuBit?.idx).toBe('hygiene-audit')
        expect(resolved?.mnuBit?.val).toBe(0)
        expect(
            consoleLines.some((l) =>
                l.includes(
                    '[HYGIENE:OK] Zero packages/400.conductor/src/ directory confirmed.',
                ),
            ),
        ).toBe(true)
        expect(
            consoleLines.some((l) =>
                l.includes(
                    '[COLLISION-GUARD] [OK] 25.dialogue.unit and 25.episode.unit isolated.',
                ),
            ),
        ).toBe(true)
    })
})
