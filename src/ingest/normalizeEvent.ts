import { DateTime } from "luxon";
import { loadEnv } from "../config/env";
import type { RawEventCandidate } from "../connectors/interfaces";
import type { EventInput, EventSourceInput } from "../core/models/event";
import { eventInputSchema, eventSourceInputSchema } from "../core/validation/eventSchemas";

export interface NormalizedEvent {
  event: EventInput;
  source: EventSourceInput;
}

const CONFIDENCE_THRESHOLD = 0.5;

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = DateTime.fromISO(value, { setZone: true });
  if (parsed.isValid) {
    return parsed.set({ second: 0, millisecond: 0 }).toJSDate();
  }
  return null;
}

export function normalizeEventCandidate(userId: string, candidate: RawEventCandidate): NormalizedEvent | null {
  if (candidate.confidence < CONFIDENCE_THRESHOLD) {
    return null;
  }

  const env = loadEnv();
  const startAt = parseDate(candidate.startAt);
  const endAt = parseDate(candidate.endAt);
  const timezone = candidate.timezone ?? env.DEFAULT_TIMEZONE;
  const normalizedTitle = candidate.title.trim().toLowerCase();
  const completeness = startAt && (candidate.locationName || candidate.locationAddress) ? "complete" : "incomplete";

  const event: EventInput = {
    userId,
    title: candidate.title,
    normalizedTitle,
    description: candidate.description,
    startAt,
    endAt,
    timezone,
    locationName: candidate.locationName ?? null,
    locationAddress: candidate.locationAddress ?? null,
    status: "confirmed",
    completeness,
    confidence: candidate.confidence,
  };

  const source: EventSourceInput = {
    sourceType: candidate.sourceType,
    sourceRef: candidate.sourceRef,
    extractedAt: new Date(candidate.extractedAt),
    rawExcerptHash: null,
    confidence: candidate.confidence,
    metadata: candidate.metadata ?? null,
    webSourceId: candidate.webSourceId ?? null,
    channelConnectionId: candidate.channelConnectionId ?? null,
  };

  const eventParsed = eventInputSchema.safeParse(event);
  if (!eventParsed.success) {
    return null;
  }

  const sourceParsed = eventSourceInputSchema.safeParse(source);
  if (!sourceParsed.success) {
    return null;
  }

  return { event: eventParsed.data, source: sourceParsed.data };
}
