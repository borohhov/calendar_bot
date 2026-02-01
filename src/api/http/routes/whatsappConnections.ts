import type { FastifyInstance } from "fastify";
import { createWhatsAppConnection, revokeWhatsAppConnection } from "../../../services/connections";

export async function whatsappConnectionRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const body = request.body as { providerInstanceId: string; callbackUrl: string };
    const connection = await createWhatsAppConnection(body);
    reply.status(201).send(connection);
  });

  app.delete("/:connectionId", async (request, reply) => {
    const { connectionId } = request.params as { connectionId: string };
    await revokeWhatsAppConnection(connectionId);
    reply.status(204).send();
  });
}
