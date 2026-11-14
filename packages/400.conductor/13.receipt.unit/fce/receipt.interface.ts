import { z } from 'zod'
import ReceiptBit from './receipt.bit.js'

export const EpisodeStackReceiptSchema = z
    .object({
        schema_version: z.literal('1.0.0'),
        scene_count: z.number().int().min(0),
        total_frames: z.number().int().min(0),
        total_duration_ms: z.number().int().min(0),
        manifest_sha256: z.string().regex(/^[0-9a-f]{64}$/),
        all_six_categories_verified: z.boolean(),
    })
    .strict()

export type EpisodeStackReceipt = z.infer<typeof EpisodeStackReceiptSchema>

export default interface Receipt {
    idx: string
    receiptBitList: ReceiptBit[]
    receiptBits: Record<string, unknown>
    lastReceipt: EpisodeStackReceipt | null
}
