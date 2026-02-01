import { randomUUID } from "node:crypto";
import { DateTime } from "luxon";
import type { Event, User } from "@prisma/client";
import { listEvents } from "../events/eventQueryService";
import { buildClarificationQuestion, buildEventSummary } from "./qaService";
import { parseQuery, type ParsedQuery } from "./queryParser";
import { loadEnv } from "../../config/env";
import { requestJsonResponse } from "../llm/openaiClient";

export type ChatResponseStatus = "answer" | "no_answer" | "clarify";

export interface ChatQuestionRequest {
  question: string;
  timezone?: string;
  clientMessageId?: string;
}

export interface EventReference {
  eventId: string;
  title: string;
  startAt: string | null;
  timezone: string;
  sourceLabel?: string;
}

export interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: string;
  status: "sent" | "pending" | "failed";
  kind: ChatResponseStatus;
  eventReferences: EventReference[];
}

export interface ChatAnswerResponse {
  status: ChatResponseStatus;
  message: ChatMessage;
  retryAllowed: boolean;
}

interface WebChatAnswerInput {
  question: string;
  timezone?: string;
}

const DEFAULT_NO_ANSWER_MESSAGE =
  "I couldn't find any events for that period. Please email support@ananda.bot for help or try a different date range.";

interface LlmInterpretation {
  needs_clarification: boolean;
  clarification_question: string | null;
  start_date: string | null;
  end_date: string | null;
  search_query: string | null;
}

export async function buildWebChatAnswer(user: User, input: WebChatAnswerInput): Promise<ChatAnswerResponse> {
  const question = input.question.trim();
  const timezone = input.timezone ?? user.timezone;
  const displayUser: User = { ...user, timezone };

  const interpretation = await interpretQuestion(question, timezone);
  if (interpretation.needs_clarification) {
    const clarification =
      interpretation.clarification_question?.trim() || buildClarificationQuestion();
    return buildResponse("clarify", clarification, timezone, []);
  }

  const parsed = parseRangeWithFallback(interpretation, question);
  if (parsed.needsClarification || !parsed.start || !parsed.end) {
    return buildResponse("clarify", buildClarificationQuestion(), timezone, []);
  }

  const events = await listEvents(user.id, {
    start: parsed.start.toISOString(),
    end: parsed.end.toISOString(),
    includeIncomplete: false,
    query: interpretation.search_query ?? question,
  });

  if (events.length === 0) {
    const message = await buildNoEventsMessage(question, timezone);
    return buildResponse("no_answer", message, timezone, [], true);
  }

  const messageText = await buildEventAnswer(question, displayUser, events);
  const references = buildEventReferences(events, timezone);

  return buildResponse("answer", messageText, timezone, references);
}

function buildResponse(
  status: ChatResponseStatus,
  text: string,
  timezone: string,
  eventReferences: EventReference[],
  retryAllowed = false,
): ChatAnswerResponse {
  return {
    status,
    retryAllowed,
    message: {
      id: randomUUID(),
      sender: "assistant",
      text,
      timestamp: DateTime.now().setZone(timezone).toISO() ?? new Date().toISOString(),
      status: "sent",
      kind: status,
      eventReferences,
    },
  };
}

function buildEventReferences(events: Event[], fallbackTimezone: string): EventReference[] {
  return events.slice(0, 6).map((event) => {
    const timezone = event.timezone || fallbackTimezone;
    const startAt = event.startAt
      ? DateTime.fromJSDate(event.startAt).setZone(timezone).toISO()
      : null;

    return {
      eventId: event.id,
      title: event.title,
      startAt,
      timezone,
      sourceLabel: event.locationName ?? undefined,
    };
  });
}

async function interpretQuestion(question: string, timezone: string): Promise<LlmInterpretation> {
  const today = DateTime.now().setZone(timezone).toISODate();
  const instructions = [
    "You interpret event questions to determine a date range.",
    "If the question does not include enough time information, ask a clarifying question instead of guessing.",
    "Return a JSON object that matches the provided schema.",
  ].join(" ");

  const schema = {
    name: "event_question_interpretation",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["needs_clarification", "clarification_question", "start_date", "end_date", "search_query"],
      properties: {
        needs_clarification: { type: "boolean" },
        clarification_question: { type: ["string", "null"] },
        start_date: { type: ["string", "null"], description: "ISO 8601 date or datetime" },
        end_date: { type: ["string", "null"], description: "ISO 8601 date or datetime" },
        search_query: { type: ["string", "null"] },
      },
    },
    description: "Interpretation for event question parsing",
    strict: true,
  };

  try {
    return await requestJsonResponse<LlmInterpretation>({
      input: `Today is ${today}. User timezone is ${timezone}. Question: ${question}`,
      instructions,
      schema,
      temperature: 0.1,
      maxOutputTokens: 200,
    });
  } catch (error) {
    const fallback = parseRangeWithFallback(null, question);
    return {
      needs_clarification: fallback.needsClarification,
      clarification_question: fallback.needsClarification ? buildClarificationQuestion() : null,
      start_date: fallback.start?.toISOString() ?? null,
      end_date: fallback.end?.toISOString() ?? null,
      search_query: question,
    };
  }
}

function parseRangeWithFallback(
  interpretation: LlmInterpretation | null,
  question: string,
): ParsedQuery {
  if (interpretation?.start_date && interpretation?.end_date) {
    const start = DateTime.fromISO(interpretation.start_date);
    const end = DateTime.fromISO(interpretation.end_date);
    if (start.isValid && end.isValid) {
      return { start: start.toJSDate(), end: end.toJSDate(), needsClarification: false };
    }
  }

  return parseQuery(question);
}

async function buildEventAnswer(question: string, user: User, events: Event[]): Promise<string> {
  const timezone = user.timezone;
  const items = events.slice(0, 8).map((event) => {
    const start = event.startAt
      ? DateTime.fromJSDate(event.startAt).setZone(timezone).toFormat("ccc, LLL d 'at' HH:mm")
      : "TBD";
    const location = event.locationName ? ` - ${event.locationName}` : "";
    return `- ${event.title} (${start})${location}`;
  });

  const instructions = [
    "You are an event assistant responding in a friendly chat tone.",
    "Use only the provided events. Do not invent details.",
    "If the question asks for recommendations, list the events in a short bullet list.",
  ].join(" ");

  const schema = {
    name: "event_answer",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["answer"],
      properties: {
        answer: { type: "string" },
      },
    },
    strict: true,
  };

  try {
    const response = await requestJsonResponse<{ answer: string }>({
      input: `Question: ${question}\nEvents:\n${items.join("\n")}`,
      instructions,
      schema,
      temperature: 0.3,
      maxOutputTokens: 400,
    });
    return response.answer;
  } catch (error) {
    return buildEventSummary(user, events);
  }
}

async function buildNoEventsMessage(question: string, timezone: string): Promise<string> {
  const env = loadEnv();
  const supportEmail = env.SUPPORT_EMAIL;
  const instructions = [
    "Respond that no matching events were found.",
    "Ask the user to try a different date range.",
    `Tell the user to send an email to ${supportEmail} for help.`,
  ].join(" ");

  const schema = {
    name: "no_events_response",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["answer"],
      properties: {
        answer: { type: "string" },
      },
    },
    strict: true,
  };

  try {
    const response = await requestJsonResponse<{ answer: string }>({
      input: `Question: ${question}\nUser timezone: ${timezone}`,
      instructions,
      schema,
      temperature: 0.2,
      maxOutputTokens: 200,
    });
    return response.answer;
  } catch (error) {
    return DEFAULT_NO_ANSWER_MESSAGE.replace("support@ananda.bot", supportEmail);
  }
}
