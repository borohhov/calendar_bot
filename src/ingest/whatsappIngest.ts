import * as chrono from "chrono-node";
import { ingestEventCandidates } from "../services/events/eventService";
import { findActiveConnectionByUser, findConnectionById } from "../storage/repositories/connectionRepository";
import { getOrCreateSingleUser } from "../services/users/singleUser";

export interface WhatsAppWebhookPayload {
  messageId: string;
  from: string;
  body: string;
  timestamp: string;
  connectionId?: string;
}

function extractLocation(body: string): string | undefined {
  const match = body.match(/\bat\s+([^,.\n]+)/i);
  if (!match) return undefined;
  return match[1].trim();
}

export async function ingestWhatsAppPayload(payload: WhatsAppWebhookPayload) {
  const user = await getOrCreateSingleUser();
  const connection = payload.connectionId
    ? await findConnectionById(payload.connectionId)
    : await findActiveConnectionByUser(user.id);

  const parsedDate = chrono.parseDate(payload.body) ?? undefined;
  const confidence = parsedDate ? 0.8 : 0.45;

  const candidates = [
    {
      title: payload.body.slice(0, 120),
      description: payload.body,
      startAt: parsedDate ? parsedDate.toISOString() : undefined,
      sourceRef: payload.messageId,
      sourceType: "whatsapp" as const,
      extractedAt: payload.timestamp ?? new Date().toISOString(),
      confidence,
      rawText: payload.body,
      locationName: extractLocation(payload.body),
      metadata: {
        from: payload.from,
      },
      channelConnectionId: connection?.id,
    },
  ];

  return ingestEventCandidates(user.id, candidates);
}
