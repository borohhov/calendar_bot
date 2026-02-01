import { z } from "zod";

export const crawlJobCreateSchema = z.object({
  entryUrls: z.array(z.string().url()).min(1),
  maxDepth: z.coerce.number().int().min(0).max(10),
  allowExternal: z.boolean().optional().default(false),
  webSourceId: z.string().optional(),
});

export type CrawlJobCreateInput = z.infer<typeof crawlJobCreateSchema>;
