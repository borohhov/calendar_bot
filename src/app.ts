import Fastify from "fastify";
import { loadEnv } from "./config/env";
import { logger } from "./observability/logger";
import { registerErrorHandler } from "./api/http/errorHandler";
import { registerHttpRoutes } from "./api/http";
import { getMetrics } from "./observability/metrics";

export function buildApp() {
  const env = loadEnv();
  const app = Fastify({ logger });

  registerErrorHandler(app);
  registerHttpRoutes(app);

  app.get("/metrics", async (_request, reply) => {
    const metrics = await getMetrics();
    reply.type("text/plain").send(metrics);
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.log.info({ env: env.NODE_ENV }, "App initialized");
  return app;
}
