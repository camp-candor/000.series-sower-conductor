import { z } from 'zod'

export const HardwareLeaseReceiptSchema = z
    .object({
        leaseId: z.string().min(1),
        epoch: z.number().int().positive(),
        sceneId: z.string().min(1),
        grantedAtMs: z.number().positive(),
        ttlMs: z.number().positive(),
        status: z.enum(['ACTIVE', 'EXPIRED', 'ZOMBIE_REJECTED']),
    })
    .strict()

export const TelemetryIngressPayloadSchema = z
    .object({
        sceneId: z.string().min(1),
        episodeId: z.string().min(1),
        currentStage: z.string().min(1),
        totalFrames: z.number().int().nonnegative(),
        vramUsedMb: z.literal(0),
        lockfileSha256: z.string().nullable(),
        epoch: z.number().int().positive(),
    })
    .strict()
