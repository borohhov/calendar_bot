import { DateTime } from "luxon";
import * as cheerio from "cheerio";
import type { RawEventCandidate } from "../connectors/interfaces";
import { extractEventsFromHtml, findCalendarFeedUrls } from "../connectors/web/extractors";
import { ingestEventCandidates } from "../services/events/eventService";
import { findWebSourceById, updateWebSource } from "../storage/repositories/webSourceRepository";

interface CalendarFeedItem {
  date: string;
  title: string;
  body: string;
}

function buildFeedUrls(seedUrl: string, monthsToFetch: number): string[] {
  const seed = new URL(seedUrl);
  const base = `${seed.origin}${seed.pathname}`;
  const lang = seed.searchParams.get("lang") ?? "en-US";
  const urls: string[] = [];

  for (let i = 0; i < monthsToFetch; i += 1) {
    const dt = DateTime.now().plus({ months: i });
    const month = `${dt.month}`.padStart(2, "0");
    urls.push(`${base}?lang=${lang}&mese=${month}&anno=${dt.year}`);
  }

  return urls;
}

function extractFeedCandidates(items: CalendarFeedItem[], feedUrl: string): RawEventCandidate[] {
  const candidates: RawEventCandidate[] = [];
  const extractedAt = new Date().toISOString();

  for (const item of items) {
    const $ = cheerio.load(item.body ?? "");
    const anchors = $("a");
    const date = DateTime.fromISO(item.date);
    const startAt = date.isValid ? date.toISODate() ?? undefined : undefined;

    anchors.each((_, element) => {
      const text = $(element).text().replace(/^-\s*/, "").trim();
      if (!text) return;

      const href = $(element).attr("href");
      const sourceRef = href ? new URL(href, feedUrl).toString() : feedUrl;

      candidates.push({
        title: text,
        description: item.title,
        startAt,
        sourceRef,
        sourceType: "web",
        extractedAt,
        confidence: 0.75,
        metadata: {
          calendarDate: item.date,
          feedUrl,
        },
      });
    });
  }

  return candidates;
}

async function fetchCalendarFeedCandidates(seedUrl: string): Promise<RawEventCandidate[]> {
  const urls = buildFeedUrls(seedUrl, 3);
  const results: RawEventCandidate[] = [];

  for (const url of urls) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar feed ${url}: ${response.status}`);
    }
    const data = (await response.json()) as CalendarFeedItem[];
    results.push(...extractFeedCandidates(data, url));
  }

  return results;
}

export async function ingestWebSource(webSourceId: string) {
  const webSource = await findWebSourceById(webSourceId);
  if (!webSource) {
    throw new Error("Web source not found");
  }

  const response = await fetch(webSource.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${webSource.url}: ${response.status}`);
  }

  const html = await response.text();
  const calendarFeeds = findCalendarFeedUrls(html);
  let candidates: RawEventCandidate[] = [];

  if (calendarFeeds.courses || calendarFeeds.events) {
    if (calendarFeeds.courses) {
      candidates = candidates.concat(await fetchCalendarFeedCandidates(calendarFeeds.courses));
    }
    if (calendarFeeds.events) {
      candidates = candidates.concat(await fetchCalendarFeedCandidates(calendarFeeds.events));
    }
  } else {
    candidates = extractEventsFromHtml(html, webSource.url);
  }

  candidates = candidates.map((candidate) => ({
    ...candidate,
    sourceRef: candidate.sourceRef || webSource.url,
    webSourceId: webSource.id,
    metadata: {
      ...(candidate.metadata ?? {}),
      webSourceId: webSource.id,
    },
  }));

  await updateWebSource(webSource.id, { lastCrawledAt: new Date() });
  return ingestEventCandidates(webSource.userId, candidates);
}
