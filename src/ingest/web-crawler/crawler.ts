import { ingestEventCandidates } from "../../services/events/eventService";
import { createCrawlPage, updateCrawlPage } from "../../storage/repositories/crawlPageRepository";
import { findCrawlJobById, updateCrawlJob } from "../../storage/repositories/crawlJobRepository";
import { logger } from "../../observability/logger";
import { crawlEventsCounter, crawlPagesCounter } from "../../observability/metrics";
import { fetchHtml } from "./fetcher";
import { discoverLinks } from "./link-discovery";
import { extractEventCandidates } from "./extract-event";
import { summarizeText } from "./summarize";
import { canonicalizeUrl, isSameSite } from "./url-utils";

interface QueueItem {
  url: string;
  depth: number;
  discoveredFrom?: string;
}

function truncateText(text?: string, maxLength = 2000): string | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 3).trim()}...`;
}

export async function runCrawlJob(crawlJobId: string): Promise<void> {
  const crawlJob = await findCrawlJobById(crawlJobId);
  if (!crawlJob) {
    throw new Error(`Crawl job not found: ${crawlJobId}`);
  }

  const entryUrls = crawlJob.entryUrls.map((url) => canonicalizeUrl(url) ?? url);
  const roots = entryUrls
    .map((url) => {
      try {
        return new URL(url);
      } catch {
        return null;
      }
    })
    .filter((url): url is URL => Boolean(url));

  await updateCrawlJob(crawlJob.id, {
    status: "running",
    startedAt: new Date(),
    errorSummary: null,
  });

  const queue: QueueItem[] = entryUrls.map((url) => ({ url, depth: 0 }));
  const visited = new Set<string>();
  const seenEventIds = new Set<string>();
  let pagesVisited = 0;
  let pagesFailed = 0;

  try {
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;

      const canonical = canonicalizeUrl(current.url);
      if (!canonical) continue;
      if (visited.has(canonical)) continue;
      visited.add(canonical);

      let urlObject: URL;
      try {
        urlObject = new URL(canonical);
      } catch {
        continue;
      }

      if (!crawlJob.allowExternal && !isSameSite(urlObject, roots)) {
        crawlPagesCounter.inc({ status: "skipped" });
        await createCrawlPage({
          crawlJob: { connect: { id: crawlJob.id } },
          url: canonical,
          depth: current.depth,
          status: "skipped",
          error: "external-domain",
          discoveredFrom: current.discoveredFrom,
        });
        continue;
      }

      const fetchResult = await fetchHtml(canonical);
      if (!fetchResult.ok || !fetchResult.body) {
        crawlPagesCounter.inc({ status: "failed" });
        pagesFailed += 1;
        await createCrawlPage({
          crawlJob: { connect: { id: crawlJob.id } },
          url: canonical,
          depth: current.depth,
          status: "failed",
          httpStatus: fetchResult.status || null,
          error: fetchResult.error ?? "fetch failed",
          discoveredFrom: current.discoveredFrom,
        });
        continue;
      }

      const crawlPage = await createCrawlPage({
        crawlJob: { connect: { id: crawlJob.id } },
        url: canonical,
        depth: current.depth,
        status: "fetched",
        httpStatus: fetchResult.status,
        contentHash: fetchResult.contentHash,
        discoveredFrom: current.discoveredFrom,
      });

      crawlPagesCounter.inc({ status: "fetched" });
      pagesVisited += 1;

      const { candidates, pageText } = extractEventCandidates(fetchResult.body, canonical);
      if (candidates.length > 0) {
        const enriched = candidates.map((candidate) => ({
          ...candidate,
          sourceRef: candidate.sourceRef || canonical,
          extractedAt: new Date().toISOString(),
          description: truncateText(candidate.description ?? pageText),
          webSourceId: crawlJob.webSourceId ?? undefined,
          metadata: {
            ...(candidate.metadata ?? {}),
            crawlJobId: crawlJob.id,
            crawlPageId: crawlPage.id,
            summary: summarizeText(truncateText(candidate.description ?? pageText) ?? candidate.title),
          },
        }));

        const ingested = await ingestEventCandidates(crawlJob.userId, enriched);
        crawlEventsCounter.inc(ingested.length);
        for (const event of ingested) {
          seenEventIds.add(event.id);
        }
      }

      if (current.depth < crawlJob.maxDepth) {
        const links = discoverLinks(fetchResult.body, canonical);
        for (const link of links) {
          if (!visited.has(link)) {
            queue.push({ url: link, depth: current.depth + 1, discoveredFrom: canonical });
          }
        }
      }

      await updateCrawlPage(crawlPage.id, { status: "parsed", parsedAt: new Date() });
    }

    await updateCrawlJob(crawlJob.id, {
      status: "completed",
      pagesVisited,
      pagesFailed,
      eventsCaptured: seenEventIds.size,
      completedAt: new Date(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Crawl failed";
    logger.error({ err: error, crawlJobId: crawlJob.id }, "Crawl job failed");
    await updateCrawlJob(crawlJob.id, {
      status: "failed",
      pagesVisited,
      pagesFailed,
      eventsCaptured: seenEventIds.size,
      errorSummary: message,
      completedAt: new Date(),
    });
    throw error;
  }
}
