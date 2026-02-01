import type { Event, EventSource, Prisma } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createEvent(data: Prisma.EventCreateInput): Promise<Event> {
  return prisma.event.create({ data });
}

export async function updateEvent(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
  return prisma.event.update({ where: { id }, data });
}

export async function findEventById(id: string): Promise<Event | null> {
  return prisma.event.findUnique({ where: { id }, include: { sources: true } });
}

export async function findEventByDedupeKey(
  userId: string,
  normalizedTitle: string,
  startAt: Date | null,
): Promise<Event | null> {
  return prisma.event.findFirst({
    where: {
      userId,
      normalizedTitle,
      startAt,
    },
    include: { sources: true },
  });
}

export async function listEventsByRange(
  userId: string,
  start: Date,
  end: Date,
  includeIncomplete = false,
  query?: string,
): Promise<Event[]> {
  const dateFilter = includeIncomplete
    ? {
        OR: [{ startAt: { gte: start, lte: end } }, { startAt: null }],
      }
    : { startAt: { gte: start, lte: end } };

  return prisma.event.findMany({
    where: {
      userId,
      ...(includeIncomplete ? {} : { completeness: "complete" }),
      ...dateFilter,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { startAt: "asc" },
    include: { sources: true },
  });
}

export async function createEventSource(data: Prisma.EventSourceCreateInput): Promise<EventSource> {
  return prisma.eventSource.create({ data });
}

export async function addEventSources(eventId: string, sources: Prisma.EventSourceCreateManyInput[]): Promise<void> {
  if (sources.length === 0) return;
  await prisma.eventSource.createMany({ data: sources.map((source) => ({ ...source, eventId })) });
}

export async function deleteEvent(id: string): Promise<Event> {
  return prisma.event.delete({ where: { id } });
}

export async function listEventsForUser(userId: string): Promise<Event[]> {
  return prisma.event.findMany({ where: { userId }, include: { sources: true } });
}

export async function listEventsByCrawlJob(userId: string, crawlJobId: string): Promise<Event[]> {
  return prisma.event.findMany({
    where: {
      userId,
      sources: {
        some: {
          metadata: {
            path: ["crawlJobId"],
            equals: crawlJobId,
          },
        },
      },
    },
    orderBy: { startAt: "asc" },
    include: { sources: true },
  });
}
