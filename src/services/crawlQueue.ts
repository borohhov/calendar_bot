import { webCrawlQueue } from "../scheduler/queues";

export async function enqueueCrawlJob(crawlJobId: string) {
  return webCrawlQueue.add("crawl-job", { crawlJobId });
}
