import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";

interface MockConnection {
  id: string;
  providerInstanceId: string;
  callbackUrl: string;
  status: "active" | "revoked";
}

interface MockMessage {
  id: string;
  connectionId: string;
  to: string;
  body: string;
  createdAt: string;
}

const connections = new Map<string, MockConnection>();
const messages: MockMessage[] = [];

export async function mockWhatsAppProviderRoutes(app: FastifyInstance) {
  app.post("/connections", async (request) => {
    const body = request.body as { providerInstanceId: string; callbackUrl: string };
    const connection: MockConnection = {
      id: randomUUID(),
      providerInstanceId: body.providerInstanceId,
      callbackUrl: body.callbackUrl,
      status: "active",
    };
    connections.set(connection.id, connection);
    return { id: connection.id, status: connection.status, providerInstanceId: connection.providerInstanceId };
  });

  app.delete("/connections/:connectionId", async (request, reply) => {
    const { connectionId } = request.params as { connectionId: string };
    const connection = connections.get(connectionId);
    if (!connection) {
      reply.status(404).send({ error: "not_found" });
      return;
    }
    connection.status = "revoked";
    connections.set(connectionId, connection);
    reply.status(204).send();
  });

  app.post("/connections/:connectionId/messages", async (request) => {
    const { connectionId } = request.params as { connectionId: string };
    const body = request.body as { to: string; body: string };
    const message: MockMessage = {
      id: randomUUID(),
      connectionId,
      to: body.to,
      body: body.body,
      createdAt: new Date().toISOString(),
    };
    messages.push(message);
    return { id: message.id, status: "sent" };
  });

  app.get("/messages", async () => {
    return messages.slice(-50);
  });
}
