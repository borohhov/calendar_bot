import type { FastifyInstance } from "fastify";
import { eventRoutes } from "./routes/events";
import { eventExportRoutes } from "./routes/eventsExport";
import { preferenceRoutes } from "./routes/preferences";
import { chatWebRoutes } from "./routes/chatWeb";
import { whatsappConnectionRoutes } from "./routes/whatsappConnections";
import { whatsappWebhookRoutes } from "../webhooks/whatsapp";
import { mockWhatsAppProviderRoutes } from "./routes/mockWhatsAppProvider";
import { loadEnv } from "../../config/env";

export function registerHttpRoutes(app: FastifyInstance): void {
  const env = loadEnv();
  app.get("/", async () => ({ name: "ananda-bot" }));

  if (!env.DISABLE_WORKERS) {
    const { webSourceRoutes } = require("./routes/webSources");
    const { crawlJobRoutes } = require("./routes/crawlJobs");
    app.register(webSourceRoutes, { prefix: "/sources/web" });
    app.register(crawlJobRoutes, { prefix: "/crawl-jobs" });
  } else {
    app.log.info("Worker-dependent routes disabled; Redis not required.");
  }
  app.register(chatWebRoutes, { prefix: "/chat" });
  app.register(whatsappConnectionRoutes, { prefix: "/connections/whatsapp" });
  app.register(eventRoutes, { prefix: "/events" });
  app.register(eventExportRoutes, { prefix: "/events/export" });
  app.register(preferenceRoutes, { prefix: "/preferences" });
  app.register(whatsappWebhookRoutes, { prefix: "/webhooks" });

  if (env.NODE_ENV !== "production") {
    app.register(mockWhatsAppProviderRoutes, { prefix: "/mock/whatsapp" });
  }
}
