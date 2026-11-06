import { z } from 'zod'

export const MasterSceneStageSchema = z.enum([
    'STAGE_0_IDLE',
    'STAGE_1_INCEPTION_PREFLIGHT',
    'STAGE_2_AST_VERBATIM_LOCK',
    'STAGE_3_ACOUSTIC_QUANTIZATION',
    'STAGE_4_MODEL_CONFORMANCE',
    'STAGE_5_HARDWARE_MUTEX_ACQUIRED',
    'STAGE_6_METAPROGRAM_STAMPED',
    'STAGE_7_OPTICAL_PRINTED',
    'STAGE_8_PROVENANCE_SEALED',
    'STAGE_FAILED_DLQ',
    'STAGE_ESCALATED_HUMAN_REVIEW',
])

export const ShotLifecycleItemSchema = z
    .object({
        shotId: z.string().min(1),
        speakerId: z.string().min(1),
        dialogueText: z
            .string()
            .min(1)
            .regex(
                /^[\x20-\x7E\r\n\t]*$/,
                'dialogueText must be 7-bit clean ASCII',
            ),
        durationMs: z.number().positive(),
        frameBudget: z.number().int().positive().optional(),
        audioWavPath: z.string().optional(),
        videoPlatePath: z.string().optional(),
        bgMattePath: z.string().optional(),
    })
    .strict()

export const MasterSceneLifecycleContextSchema = z
    .object({
        sceneId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
        episodeId: z.string().min(1),
        currentStage: MasterSceneStageSchema,
        isDirty: z.boolean(),
        shots: z.array(ShotLifecycleItemSchema),
        totalFrames: z.number().int().nonnegative(),
        activeLeaseId: z.string().nullable(),
        activeEpoch: z.number().int().positive().nullable(),
        stampedTsxPath: z.string().nullable(),
        outputDeliverablePath: z.string().nullable(),
        lockfileSha256: z.string().nullable(),
        vramUsedMb: z.literal(0),
        t0Spend: z.literal('$0.00'),
        t4Spend: z.literal('$0.00'),
        attemptCount: z.number().int().nonnegative(),
        maxAttempts: z.number().int().positive(),
        telemetryLogs: z.array(z.string()),
        lastError: z.string().optional(),
    })
    .strict()
