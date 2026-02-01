import * as cheerio from "cheerio";
import * as chrono from "chrono-node";
import type { RawEventCandidate } from "../../connectors/interfaces";
import { extractEventsFromHtml } from "../../connectors/web/extractors";

function extractMetaDescription($: cheerio.CheerioAPI): string | undefined {
  const meta = $("meta[name='description']").attr("content")?.trim();
  if (meta) return meta;
  const og = $("meta[property='og:description']").attr("content")?.trim();
  return og || undefined;
}

function extractBodyText($: cheerio.CheerioAPI): string {
  const selectors = ["article", "main", "body"];
  for (const selector of selectors) {
    const text = $(selector).text().replace(/\s+/g, " ").trim();
    if (text.length > 0) return text;
  }
  return "";
}

export function extractEventCandidates(html: string, sourceUrl: string): { candidates: RawEventCandidate[]; pageText: string } {
  const baseCandidates = extractEventsFromHtml(html, sourceUrl);
  const $ = cheerio.load(html);
  const metaDescription = extractMetaDescription($);
  const pageText = extractBodyText($);
  const parsedDate = chrono.parseDate(pageText) ?? undefined;
  const minDescriptionLength = 80;

  const candidates = baseCandidates.map((candidate) => {
    const startAt = candidate.startAt ?? (parsedDate ? parsedDate.toISOString() : undefined);
    const confidence = startAt ? Math.max(candidate.confidence, 0.6) : candidate.confidence;
    let description = candidate.description;

    if (!description || description.trim().length < minDescriptionLength) {
      if (metaDescription && metaDescription.length > (description?.length ?? 0)) {
        description = metaDescription;
      }
      if (pageText.length > (description?.length ?? 0)) {
        description = pageText;
      }
    }

    return {
      ...candidate,
      description,
      startAt,
      confidence,
    } as RawEventCandidate;
  });

  return { candidates, pageText };
}
