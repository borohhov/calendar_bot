import type { CrawlJob } from "@prisma/client";
import { NotFoundError } from "../core/errors";
import type { CrawlJobCreateInput } from "../core/crawl-schemas";
import { createCrawlJob, findCrawlJobById } from "../storage/repositories/crawlJobRepository";
import { listEventsByCrawlJob } from "../storage/repositories/eventRepository";
import { enqueueCrawlJob } from "./crawlQueue";
import { getOrCreateSingleUser } from "./users/singleUser";

export async function submitCrawlJob(input: CrawlJobCreateInput): Promise<CrawlJob> {
  const user = await getOrCreateSingleUser();
  const created = await createCrawlJob({
    user: { connect: { id: user.id } },
    webSource: input.webSourceId ? { connect: { id: input.webSourceId } } : undefined,
    entryUrls: input.entryUrls,
    maxDepth: input.maxDepth,
    allowExternal: input.allowExternal ?? false,
    status: "queued",
  });

  await enqueueCrawlJob(created.id);
  return created;
}

export async function getCrawlJob(jobId: string): Promise<CrawlJob> {
  const job = await findCrawlJobById(jobId);
  if (!job) {
    throw new NotFoundError("Crawl job not found");
  }
  return job;
}

export async function listCrawlJobEvents(jobId: string) {
  const user = await getOrCreateSingleUser();
  await getCrawlJob(jobId);
  return listEventsByCrawlJob(user.id, jobId);
}
