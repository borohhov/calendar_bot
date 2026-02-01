export type EventCompleteness = "complete" | "incomplete";
export type EventStatus = "confirmed" | "tentative" | "canceled";

export interface EventInput {
  userId: string;
  title: string;
  normalizedTitle: string;
  description?: string;
  startAt?: Date | null;
  endAt?: Date | null;
  timezone: string;
  locationName?: string | null;
  locationAddress?: string | null;
  status: EventStatus;
  completeness: EventCompleteness;
  confidence: number;
}

export interface EventSourceInput {
  sourceType: "web" | "whatsapp";
  sourceRef: string;
  extractedAt: Date;
  rawExcerptHash?: string | null;
  confidence: number;
  metadata?: Record<string, unknown> | null;
  webSourceId?: string | null;
  channelConnectionId?: string | null;
}
