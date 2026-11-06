import { z } from 'zod';

export const GridCoordinatesSchema = z
  .object({
    x: z.number().int().min(0).max(12),
    y: z.number().int().min(0).max(12),
    xSpan: z.number().int().min(1).max(12),
    ySpan: z.number().int().min(1).max(12),
  })
  .strict();

export const MenuChoiceItemSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    tooltip: z.string().min(1),
    actionType: z.string().min(1),
  })
  .strict();

export const CockpitTelemetryPacketSchema = z
  .object({
    timestamp: z.string().min(1),
    subsystem: z.string().min(1),
    level: z.enum(['INFO', 'WARN', 'ERROR', 'SUCCESS']),
    message: z
      .string()
      .regex(/^[\x20-\x7E\r\n\t]*$/, 'Message must consist strictly of 7-bit clean ASCII'),
  })
  .strict();
