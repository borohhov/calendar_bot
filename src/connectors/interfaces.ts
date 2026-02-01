export type SourceType = "web" | "whatsapp";

export interface RawEventCandidate {
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  timezone?: string;
  locationName?: string;
  locationAddress?: string;
  sourceRef: string;
  sourceType: SourceType;
  extractedAt: string;
  confidence: number;
  rawText?: string;
  metadata?: Record<string, unknown>;
  webSourceId?: string;
  channelConnectionId?: string;
}

export interface Connector<TInput = unknown> {
  name: string;
  sourceType: SourceType;
  ingest(input: TInput): Promise<RawEventCandidate[]>;
}
