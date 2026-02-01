import { ingestWebSource } from "../../ingest/webIngest";

export interface WebCrawlJobData {
  webSourceId: string;
}

export async function handleWebCrawlJob(data: WebCrawlJobData) {
  return ingestWebSource(data.webSourceId);
}
