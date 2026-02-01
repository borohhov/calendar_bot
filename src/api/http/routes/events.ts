import type { FastifyInstance } from "fastify";
import { getOrCreateSingleUser } from "../../../services/users/singleUser";
import { deleteEvent, getEvent, listEvents } from "../../../services/events/eventQueryService";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const user = await getOrCreateSingleUser();
    const query = request.query as {
      start?: string;
      end?: string;
      includeIncomplete?: string;
      q?: string;
    };

    return listEvents(user.id, {
      start: query.start,
      end: query.end,
      includeIncomplete: query.includeIncomplete === "true",
      query: query.q,
    });
  });

  app.get("/:eventId", async (request) => {
    const user = await getOrCreateSingleUser();
    const { eventId } = request.params as { eventId: string };
    return getEvent(user.id, eventId);
  });

  app.delete("/:eventId", async (request, reply) => {
    const user = await getOrCreateSingleUser();
    const { eventId } = request.params as { eventId: string };
    await deleteEvent(user.id, eventId);
    reply.status(204).send();
  });
}
