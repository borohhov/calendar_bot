import { runCrawlJob } from "./crawler";

export interface CrawlJobPayload {
  crawlJobId: string;
}

export async function handleCrawlJob(data: CrawlJobPayload) {
  return runCrawlJob(data.crawlJobId);
}
