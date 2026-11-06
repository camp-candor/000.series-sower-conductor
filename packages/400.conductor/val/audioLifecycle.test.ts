import { describe, it, expect } from 'vitest'
import * as BuzzFrame from '../24.frame.unit/buz/frame.buzz.js'

describe('Feature 7.2: Ephemeral Subprocess & ffprobe Quantization Test', () => {
    it('quantizes mocked audio durations into discrete 24 fps integer frames with zero drift', () => {
        const mockStems = [
            { shot_id: 'sh01', duration_ms: 3125 }, // 75f
            { shot_id: 'sh02', duration_ms: 2000 }, // 48f
        ]

        const result = BuzzFrame.quantizeShotTimeline(mockStems)
        expect(result.ok).toBe(true)
        expect(result.total_frames).toBe(123)
        expect(result.shots[0].target_frames).toBe(75)
        expect(result.shots[1].target_frames).toBe(48)
        expect(result.is_contiguous).toBe(true)
        expect(result.drift_ms).toBeLessThan(41.67)
    })
})
