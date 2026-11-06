import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

describe('Feature 7.2: Pure 7-Bit ASCII Monorepo Linter Test', () => {
    const unitsToScan = [
        '09.speech.unit',
        '10.somaticdsp.unit',
        '24.frame.unit',
        '32.audio.unit',
        '34.abstractsyntaxtree.unit',
        '36.edgebridge.unit',
        '37.lifecycle.unit',
        '98.menu.unit',
    ]

    it('scans all TypeScript source files asserting zero multi-byte characters', () => {
        for (const unit of unitsToScan) {
            const unitDir = path.resolve('packages/400.conductor', unit)
            if (!fs.existsSync(unitDir)) continue

            const scanDirectory = (dir: string) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true })
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name)
                    if (entry.isDirectory()) {
                        scanDirectory(fullPath)
                    } else if (entry.name.endsWith('.ts')) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        const hasNonAscii = /[\x80-\xFF]/.test(content)
                        expect(hasNonAscii).toBe(false)
                    }
                }
            }

            scanDirectory(unitDir)
        }
    })
})
