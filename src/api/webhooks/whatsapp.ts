import type { FastifyInstance } from "fastify";
import type { WhatsAppWebhookPayload } from "../../ingest/whatsappIngest";
import { handleIncomingWhatsAppMessage } from "../../services/conversation/messageRouter";

export async function whatsappWebhookRoutes(app: FastifyInstance) {
  app.post("/whatsapp", async (request) => {
    const payload = request.body as WhatsAppWebhookPayload;
    return handleIncomingWhatsAppMessage(payload);
  });
}
