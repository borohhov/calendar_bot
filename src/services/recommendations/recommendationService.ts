import type { Event, Preference, User } from "@prisma/client";
import { listEvents } from "../events/eventQueryService";

export interface RecommendationOptions {
  start: string;
  end: string;
}

interface ScoredEvent {
  event: Event;
  score: number;
  reasons: string[];
}

function scoreEvent(event: Event, preference: Preference | null): ScoredEvent {
  const reasons: string[] = [];
  let score = 1;

  if (preference) {
    for (const location of preference.preferredLocations ?? []) {
      const text = `${event.title} ${event.locationName ?? ""} ${event.locationAddress ?? ""}`.toLowerCase();
      if (text.includes(location.toLowerCase())) {
        score += 1;
        reasons.push(`matches location: ${location}`);
      }
    }

    for (const category of preference.preferredCategories ?? []) {
      const text = `${event.title} ${event.description ?? ""}`.toLowerCase();
      if (text.includes(category.toLowerCase())) {
        score += 1;
        reasons.push(`matches category: ${category}`);
      }
    }
  }

  return { event, score, reasons };
}

export async function recommendEvents(
  user: User,
  preference: Preference | null,
  options: RecommendationOptions,
): Promise<ScoredEvent[]> {
  const events = await listEvents(user.id, {
    start: options.start,
    end: options.end,
    includeIncomplete: false,
  });

  const scored = events.map((event) => scoreEvent(event, preference));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aStart = a.event.startAt?.getTime() ?? 0;
    const bStart = b.event.startAt?.getTime() ?? 0;
    return aStart - bStart;
  });

  return scored.slice(0, 8);
}
