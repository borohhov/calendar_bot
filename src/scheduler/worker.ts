import { Worker, JobsOptions, Job } from "bullmq";
import { logger } from "../observability/logger";
import { handleWebCrawlJob } from "./jobs/webCrawlJob";
import { handleCrawlJob } from "../ingest/web-crawler/worker";

const defaultJobOptions: JobsOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: 1000,
  removeOnFail: 1000,
};

async function handleWebCrawl(job: Job) {
  logger.info({ jobId: job.id, name: job.name, data: job.data }, "Processing web crawl job");
  if (job.name === "crawl-job") {
    return handleCrawlJob(job.data);
  }
  return handleWebCrawlJob(job.data);
}

export async function startWorkers() {
  const { deadLetterQueue, redisConnection } = await import("./queues");
  const webCrawlWorker = new Worker("web-crawl", handleWebCrawl, {
    connection: redisConnection,
    defaultJobOptions,
  });

  webCrawlWorker.on("failed", async (job, err) => {
    if (!job) return;
    logger.error({ err, jobId: job.id }, "Web crawl job failed");
    await deadLetterQueue.add("web-crawl", job.data);
  });

  return { webCrawlWorker };
}
