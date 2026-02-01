import { webCrawlQueue } from "./queues";

export async function scheduleWebSourceCrawl(webSourceId: string, frequencyMinutes: number) {
  const jobId = `web-source:${webSourceId}`;
  return webCrawlQueue.add(
    "web-crawl",
    { webSourceId },
    {
      jobId,
      repeat: { every: frequencyMinutes * 60 * 1000 },
    },
  );
}

export async function removeWebSourceCrawl(webSourceId: string, frequencyMinutes: number) {
  const jobId = `web-source:${webSourceId}`;
  await webCrawlQueue.removeRepeatable(
    "web-crawl",
    { every: frequencyMinutes * 60 * 1000 },
    jobId,
  );
}
