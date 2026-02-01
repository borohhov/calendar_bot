import type { FastifyInstance } from "fastify";
import { ValidationError } from "../../../core/errors";
import { crawlJobCreateSchema } from "../../../core/crawl-schemas";
import { submitCrawlJob, getCrawlJob, listCrawlJobEvents } from "../../../services/crawlJobs";

export async function crawlJobRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const parsed = crawlJobCreateSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new ValidationError("Invalid crawl job payload", { errors: parsed.error.flatten() });
    }

    const created = await submitCrawlJob(parsed.data);
    reply.status(201).send(created);
  });

  app.get("/:jobId", async (request) => {
    const { jobId } = request.params as { jobId: string };
    return getCrawlJob(jobId);
  });

  app.get("/:jobId/events", async (request) => {
    const { jobId } = request.params as { jobId: string };
    return listCrawlJobEvents(jobId);
  });
}
