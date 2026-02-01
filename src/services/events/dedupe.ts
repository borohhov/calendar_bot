import type { Event } from "@prisma/client";
import type { NormalizedEvent } from "../../ingest/normalizeEvent";
import { createEvent, findEventByDedupeKey, updateEvent, addEventSources } from "../../storage/repositories/eventRepository";

function chooseDescription(existing?: string | null, incoming?: string | null): string | undefined {
  if (!existing) return incoming ?? undefined;
  if (!incoming) return existing ?? undefined;
  return incoming.length > existing.length ? incoming : existing;
}

export async function dedupeAndMerge(normalized: NormalizedEvent): Promise<Event> {
  const { event, source } = normalized;
  const startAt = event.startAt ?? null;

  const existing = await findEventByDedupeKey(event.userId, event.normalizedTitle, startAt);
  if (!existing) {
    const created = await createEvent({
      user: { connect: { id: event.userId } },
      title: event.title,
      normalizedTitle: event.normalizedTitle,
      description: event.description,
      startAt: event.startAt ?? undefined,
      endAt: event.endAt ?? undefined,
      timezone: event.timezone,
      locationName: event.locationName ?? undefined,
      locationAddress: event.locationAddress ?? undefined,
      status: event.status,
      completeness: event.completeness,
      confidence: event.confidence,
      sources: {
        create: [
          {
            sourceType: source.sourceType,
            sourceRef: source.sourceRef,
            extractedAt: source.extractedAt,
            rawExcerptHash: source.rawExcerptHash ?? undefined,
            confidence: source.confidence,
            metadata: source.metadata ?? undefined,
            webSourceId: source.webSourceId ?? undefined,
            channelConnectionId: source.channelConnectionId ?? undefined,
          },
        ],
      },
    });

    return created;
  }

  const merged = await updateEvent(existing.id, {
    description: chooseDescription(existing.description, event.description),
    endAt: existing.endAt ?? event.endAt ?? undefined,
    locationName: existing.locationName ?? event.locationName ?? undefined,
    locationAddress: existing.locationAddress ?? event.locationAddress ?? undefined,
    completeness:
      existing.completeness === "complete" || event.completeness === "complete" ? "complete" : "incomplete",
    confidence: Math.max(existing.confidence, event.confidence),
  });

  await addEventSources(existing.id, [
    {
      sourceType: source.sourceType,
      sourceRef: source.sourceRef,
      extractedAt: source.extractedAt,
      rawExcerptHash: source.rawExcerptHash ?? null,
      confidence: source.confidence,
      metadata: source.metadata ?? null,
      webSourceId: source.webSourceId ?? null,
      channelConnectionId: source.channelConnectionId ?? null,
    },
  ]);

  return merged;
}
