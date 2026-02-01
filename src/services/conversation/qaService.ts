import { DateTime } from "luxon";
import type { Event, User } from "@prisma/client";

export function buildEventSummary(user: User, events: Event[]): string {
  if (events.length === 0) {
    return "No events found for that period.";
  }

  const lines = events.slice(0, 8).map((event) => {
    const start = event.startAt
      ? DateTime.fromJSDate(event.startAt).setZone(user.timezone).toFormat("ccc, LLL d 'at' HH:mm")
      : "TBD";
    const location = event.locationName ? ` - ${event.locationName}` : "";
    return `• ${event.title} (${start})${location}`;
  });

  const more = events.length > 8 ? `\nAnd ${events.length - 8} more.` : "";
  return `Here are the events I found:\n${lines.join("\n")}${more}`;
}

export function buildClarificationQuestion(): string {
  return "Which date range should I check? (e.g., 'this weekend' or 'next week')";
}

export function buildRecommendationSummary(
  user: User,
  recommendations: { event: Event; score: number; reasons: string[] }[],
): string {
  if (recommendations.length === 0) {
    return "I couldn't find any recommendations for that period.";
  }

  const lines = recommendations.map((rec) => {
    const start = rec.event.startAt
      ? DateTime.fromJSDate(rec.event.startAt).setZone(user.timezone).toFormat("ccc, LLL d 'at' HH:mm")
      : "TBD";
    const location = rec.event.locationName ? ` - ${rec.event.locationName}` : "";
    const reasonText = rec.reasons.length > 0 ? ` (${rec.reasons.join(", ")})` : "";
    return `• ${rec.event.title} (${start})${location}${reasonText}`;
  });

  return `Here are my recommendations:\n${lines.join("\n")}`;
}
