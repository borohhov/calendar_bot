import * as cheerio from "cheerio";
import type { RawEventCandidate } from "../interfaces";

function extractJsonLdEvents(html: string): RawEventCandidate[] {
  const $ = cheerio.load(html);
  const scripts = $("script[type='application/ld+json']");
  const candidates: RawEventCandidate[] = [];

  scripts.each((_, element) => {
    const text = $(element).text();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item || item["@type"] !== "Event") continue;
        candidates.push({
          title: item.name ?? "Untitled event",
          description: item.description ?? undefined,
          startAt: item.startDate ?? undefined,
          endAt: item.endDate ?? undefined,
          timezone: undefined,
          locationName: item.location?.name ?? undefined,
          locationAddress: item.location?.address?.streetAddress ?? undefined,
          sourceRef: item.url ?? "web",
          sourceType: "web",
          extractedAt: new Date().toISOString(),
          confidence: 0.9,
          rawText: text,
        });
      }
    } catch {
      return;
    }
  });

  return candidates;
}

export function extractEventsFromHtml(html: string, sourceRef: string): RawEventCandidate[] {
  const candidates = extractJsonLdEvents(html);
  if (candidates.length > 0) {
    return candidates.map((candidate) => ({ ...candidate, sourceRef }));
  }

  const $ = cheerio.load(html);
  const title = $("title").text().trim();
  if (!title) return [];

  return [
    {
      title,
      sourceRef,
      sourceType: "web",
      extractedAt: new Date().toISOString(),
      confidence: 0.3,
      rawText: title,
    },
  ];
}

export function findCalendarFeedUrls(html: string): { courses?: string; events?: string } {
  const pattern = /https?:\/\/[^"'\s]+PopolaCalendario(?:Eventi)?\.php\?[^"'\s]+/g;
  const urls = Array.from(html.matchAll(pattern)).map((match) => match[0]);

  let courses: string | undefined;
  let events: string | undefined;

  for (const url of urls) {
    if (url.includes("PopolaCalendarioEventi.php")) {
      events ??= url;
    } else if (url.includes("PopolaCalendario.php")) {
      courses ??= url;
    }
  }

  return { courses, events };
}
