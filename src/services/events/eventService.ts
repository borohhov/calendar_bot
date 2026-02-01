import type { RawEventCandidate } from "../../connectors/interfaces";
import { normalizeEventCandidate, type NormalizedEvent } from "../../ingest/normalizeEvent";
import { dedupeAndMerge } from "./dedupe";

export async function ingestNormalizedEvent(normalized: NormalizedEvent) {
  return dedupeAndMerge(normalized);
}

export async function ingestEventCandidates(userId: string, candidates: RawEventCandidate[]) {
  const results = [];
  for (const candidate of candidates) {
    const normalized = normalizeEventCandidate(userId, candidate);
    if (!normalized) continue;
    results.push(await ingestNormalizedEvent(normalized));
  }
  return results;
}
