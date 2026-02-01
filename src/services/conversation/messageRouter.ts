import { findConnectionById, findActiveConnectionByUser } from "../../storage/repositories/connectionRepository";
import { getOrCreateSingleUser } from "../users/singleUser";
import { ingestWhatsAppPayload, type WhatsAppWebhookPayload } from "../../ingest/whatsappIngest";
import { listEvents } from "../events/eventQueryService";
import { buildClarificationQuestion, buildEventSummary, buildRecommendationSummary } from "./qaService";
import { getOrCreateConversation, readConversationContext, updateConversationContext } from "./contextStore";
import { parseQuery } from "./queryParser";
import * as whatsappClient from "../../connectors/whatsapp/client";
import { getUserPreferences } from "../recommendations/preferencesService";
import { recommendEvents } from "../recommendations/recommendationService";

type Intent = "query" | "event" | "recommendation" | "unknown";

function detectIntent(message: string): Intent {
  const text = message.trim().toLowerCase();
  if (/(recommend|suggest|should i attend|what should i (do|go))/i.test(text)) {
    return "recommendation";
  }
  if (text.includes("?") || /^\s*(what|when|where|which|show|list)\b/.test(text)) {
    return "query";
  }
  if (/(events?|calendar|schedule)/.test(text)) {
    return "query";
  }

  const hasDate = /\b(\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?)\b/.test(text);
  if (hasDate) return "event";

  return "unknown";
}

function getProviderConnectionId(authMetadata: unknown, fallback: string): string {
  if (authMetadata && typeof authMetadata === "object") {
    const record = authMetadata as Record<string, unknown>;
    const providerId = record.providerConnectionId ?? record.providerInstanceId;
    if (typeof providerId === "string") return providerId;
  }
  return fallback;
}

export async function handleIncomingWhatsAppMessage(payload: WhatsAppWebhookPayload) {
  const user = await getOrCreateSingleUser();
  const connection = payload.connectionId
    ? await findConnectionById(payload.connectionId)
    : await findActiveConnectionByUser(user.id);

  const intent = detectIntent(payload.body);

  if (!connection) {
    if (intent === "query" || intent === "recommendation") {
      return { status: "ignored", reason: "no_connection" };
    }
    return ingestWhatsAppPayload(payload);
  }

  if (intent !== "query" && intent !== "recommendation") {
    return ingestWhatsAppPayload(payload);
  }

  const conversation = await getOrCreateConversation(user.id, connection.id);
  const context = readConversationContext(conversation);
  const parsed = parseQuery(payload.body, context);

  if (parsed.needsClarification || !parsed.start || !parsed.end) {
    const message = buildClarificationQuestion();
    await whatsappClient.sendMessage(getProviderConnectionId(connection.authMetadata, connection.id), payload.from, message);
    await updateConversationContext(conversation, {
      ...context,
      awaitingDateRange: true,
      lastQuestion: payload.body,
    });
    return { status: "clarification_sent" };
  }

  if (intent === "recommendation") {
    const preferences = await getUserPreferences();
    const recommendations = await recommendEvents(user, preferences, {
      start: parsed.start.toISOString(),
      end: parsed.end.toISOString(),
    });

    const response = buildRecommendationSummary(user, recommendations);
    await whatsappClient.sendMessage(getProviderConnectionId(connection.authMetadata, connection.id), payload.from, response);

    await updateConversationContext(conversation, {
      lastRange: { start: parsed.start.toISOString(), end: parsed.end.toISOString() },
      awaitingDateRange: false,
      lastQuestion: payload.body,
    });

    return { status: "responded", count: recommendations.length };
  }

  const events = await listEvents(user.id, {
    start: parsed.start.toISOString(),
    end: parsed.end.toISOString(),
    includeIncomplete: false,
  });

  const response = buildEventSummary(user, events);
  await whatsappClient.sendMessage(getProviderConnectionId(connection.authMetadata, connection.id), payload.from, response);

  await updateConversationContext(conversation, {
    lastRange: { start: parsed.start.toISOString(), end: parsed.end.toISOString() },
    awaitingDateRange: false,
    lastQuestion: payload.body,
  });

  return { status: "responded", count: events.length };
}
