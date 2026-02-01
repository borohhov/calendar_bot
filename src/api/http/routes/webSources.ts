import type { FastifyInstance } from "fastify";
import { createWebSource, deleteWebSource, listWebSources, updateWebSource } from "../../../services/webSources";

export async function webSourceRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return listWebSources();
  });

  app.post("/", async (request, reply) => {
    const body = request.body as {
      name?: string;
      url: string;
      crawlFrequencyMinutes: number;
    };

    const created = await createWebSource(body);
    reply.status(201).send(created);
  });

  app.patch("/:sourceId", async (request) => {
    const { sourceId } = request.params as { sourceId: string };
    const body = request.body as {
      name?: string;
      crawlFrequencyMinutes?: number;
      status?: "active" | "paused";
    };

    return updateWebSource(sourceId, body);
  });

  app.delete("/:sourceId", async (request, reply) => {
    const { sourceId } = request.params as { sourceId: string };
    await deleteWebSource(sourceId);
    reply.status(204).send();
  });
}
