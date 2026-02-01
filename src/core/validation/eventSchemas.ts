import { z } from "zod";

export const eventInputSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  normalizedTitle: z.string().min(1),
  description: z.string().optional(),
  startAt: z.date().nullable().optional(),
  endAt: z.date().nullable().optional(),
  timezone: z.string().min(1),
  locationName: z.string().nullable().optional(),
  locationAddress: z.string().nullable().optional(),
  status: z.enum(["confirmed", "tentative", "canceled"]),
  completeness: z.enum(["complete", "incomplete"]),
  confidence: z.number().min(0).max(1),
});

export const eventSourceInputSchema = z.object({
  sourceType: z.enum(["web", "whatsapp"]),
  sourceRef: z.string().min(1),
  extractedAt: z.date(),
  rawExcerptHash: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.unknown()).nullable().optional(),
  webSourceId: z.string().nullable().optional(),
  channelConnectionId: z.string().nullable().optional(),
});
