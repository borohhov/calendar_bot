import { DateTime } from "luxon";
import * as chrono from "chrono-node";
import type { ConversationContext } from "./contextStore";

export interface ParsedQuery {
  start?: Date;
  end?: Date;
  needsClarification: boolean;
}

function normalizeRange(start: Date, end?: Date): { start: Date; end: Date } {
  const startDt = DateTime.fromJSDate(start).startOf("day");
  const endDt = end ? DateTime.fromJSDate(end).endOf("day") : startDt.endOf("day");
  return { start: startDt.toJSDate(), end: endDt.toJSDate() };
}

export function parseQuery(text: string, context?: ConversationContext): ParsedQuery {
  const results = chrono.parse(text, new Date(), { forwardDate: true });
  if (results.length > 0) {
    const result = results[0];
    const start = result.start?.date();
    const end = result.end?.date();
    if (start) {
      const range = normalizeRange(start, end);
      return { start: range.start, end: range.end, needsClarification: false };
    }
  }

  if (context?.lastRange && !context.awaitingDateRange) {
    return {
      start: new Date(context.lastRange.start),
      end: new Date(context.lastRange.end),
      needsClarification: false,
    };
  }

  return { needsClarification: true };
}
