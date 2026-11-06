import { describe, it, expect } from 'vitest'
import sim from '../hunt.js'
import * as ActAsset from '../33.asset.unit/asset.action.js'
import { inspectPlateBuffer } from '../33.asset.unit/buz/asset.buzz.js'

describe('packages/400.conductor 33.asset.unit Character Plate Ingestion Validation', () => {
    function makeMockPngBuffer(size = 2048): Buffer {
        const buf = Buffer.alloc(size)
        buf[0] = 0x89
        buf[1] = 0x50 // 'P'
        buf[2] = 0x4e // 'N'
        buf[3] = 0x47 // 'G'
        return buf
    }

    function makeMockMp4Buffer(size = 4096): Buffer {
        const buf = Buffer.alloc(size)
        buf.write('ftyp', 4, 4, 'ascii')
        return buf
    }

    it('rejects plates failing the minimum size threshold (<= 1024 bytes)', () => {
        const tinyBuffer = makeMockPngBuffer(512)
        const result = inspectPlateBuffer(tinyBuffer, 'takes/bog_tiny.png')

        expect(result.valid).toBe(false)
        expect(result.rejectionClass).toBe('ZERO_BYTE_TRUNCATION')
        expect(result.error).toContain('Plate buffer too small')
    })

    it('rejects plates producing an empty-string SHA-256 digest constant', () => {
        const emptyBuffer = Buffer.alloc(0)
        const result = inspectPlateBuffer(emptyBuffer, 'takes/bog_empty.png')

        expect(result.valid).toBe(false)
        expect(result.rejectionClass).toBe('ZERO_BYTE_TRUNCATION')
    })

    it('rejects plates with invalid container format lacking PNG/MP4 magic bytes', () => {
        const corruptBuffer = Buffer.alloc(2048)
        corruptBuffer.write('INVALID_HEADER', 0, 14, 'ascii')

        const result = inspectPlateBuffer(
            corruptBuffer,
            'takes/bog_corrupt.bin',
        )
        expect(result.valid).toBe(false)
        expect(result.rejectionClass).toBe('CORRUPTED_CONTAINER')
    })

    it('rejects plates with canvas dimension mismatch', () => {
        const validPng = makeMockPngBuffer(2048)
        const result = inspectPlateBuffer(
            validPng,
            'takes/bog_square.png',
            1920,
            1080,
            {
                boundingBoxWidth: 1024,
                boundingBoxHeight: 1024,
            },
        )

        expect(result.valid).toBe(false)
        expect(result.rejectionClass).toBe('DIMENSION_MISMATCH')
        expect(result.error).toContain(
            '1024x1024 does not match expected 1920x1080',
        )
    })

    it('rejects plates where alpha green spill exceeds 12.0 ceiling', () => {
        const validPng = makeMockPngBuffer(2048)
        const result = inspectPlateBuffer(
            validPng,
            'takes/bog_fringed.png',
            1920,
            1080,
            {
                alphaGreenSpill99th: 18.5,
                internalHoleBps: 50,
            },
        )

        expect(result.valid).toBe(false)
        expect(result.rejectionClass).toBe('ALPHA_SPILL_DEFECT')
        expect(result.error).toContain('exceeds ceiling 12.0')
    })

    it('fails closed with CHROMA_MATTE_CORRUPTION when torso perforation exceeds 200 bps (2.0%)', () => {
        const validPng = makeMockPngBuffer(2048)
        const result = inspectPlateBuffer(
            validPng,
            'takes/bog_swiss_cheese.png',
            1920,
            1080,
            {
                alphaGreenSpill99th: 4.0,
                internalHoleBps: 350, // 3.5% > 2.0%
            },
        )

        expect(result.valid).toBe(false)
        expect(result.rejectionClass).toBe('CHROMA_MATTE_CORRUPTION')
        expect(result.error).toContain('CHROMA_MATTE_CORRUPTION')
    })

    it('approves compliant 1080p plate with pure alpha edges and intact torso matte', () => {
        const validPng = makeMockPngBuffer(4096)
        const result = inspectPlateBuffer(
            validPng,
            'takes/bog_clean.png',
            1920,
            1080,
            {
                alphaGreenSpill99th: 3.8,
                internalHoleBps: 40, // 0.4% <= 2.0%
                boundingBoxWidth: 1920,
                boundingBoxHeight: 1080,
            },
        )

        expect(result.valid).toBe(true)
        expect(result.width).toBe(1920)
        expect(result.height).toBe(1080)
        expect(result.metrics?.internalHoleBps).toBe(40)
    })

    it('dispatches VALIDATE_CHARACTER_PLATE cleanly through sim.hunt', async () => {
        const validMp4 = makeMockMp4Buffer(8192)
        const res = await sim.hunt!(ActAsset.VALIDATE_CHARACTER_PLATE, {
            src: 'shots/sh01_plate.mp4',
            dat: {
                shotId: 'sh01',
                characterId: 'char_bog',
                filePath: 'shots/sh01_plate.mp4',
                mockBuffer: validMp4,
                mockMetrics: {
                    alphaGreenSpill99th: 2.5,
                    internalHoleBps: 80,
                    boundingBoxWidth: 1920,
                    boundingBoxHeight: 1080,
                },
            },
        })

        expect(res).toBeDefined()
        expect(res.assetBit.val).toBe(1)
        expect(res.assetBit.dat.valid).toBe(true)
        expect(res.assetBit.dat.width).toBe(1920)
    })
})
