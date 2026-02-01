import { DateTime } from "luxon";
import { NotFoundError } from "../../core/errors";
import {
  deleteEvent as deleteEventRepo,
  findEventById,
  listEventsByRange,
  listEventsForUser,
} from "../../storage/repositories/eventRepository";

export interface EventQueryOptions {
  start?: string;
  end?: string;
  includeIncomplete?: boolean;
  query?: string;
}

export async function listEvents(userId: string, options: EventQueryOptions) {
  const startCandidate = options.start ? DateTime.fromISO(options.start) : null;
  const endCandidate = options.end ? DateTime.fromISO(options.end) : null;

  const start = startCandidate && startCandidate.isValid
    ? startCandidate.toJSDate()
    : DateTime.now().minus({ days: 30 }).toJSDate();
  const end = endCandidate && endCandidate.isValid
    ? endCandidate.toJSDate()
    : DateTime.now().plus({ days: 90 }).toJSDate();

  return listEventsByRange(userId, start, end, options.includeIncomplete ?? false, options.query);
}

export async function getEvent(userId: string, eventId: string) {
  const event = await findEventById(eventId);
  if (!event || event.userId !== userId) {
    throw new NotFoundError("Event not found");
  }
  return event;
}

export async function deleteEvent(userId: string, eventId: string) {
  const event = await findEventById(eventId);
  if (!event || event.userId !== userId) {
    throw new NotFoundError("Event not found");
  }
  return deleteEventRepo(eventId);
}

export async function exportEvents(userId: string) {
  const events = await listEventsForUser(userId);
  return {
    format: "json",
    events,
  };
}
