import { buildApp } from "./app";
import { loadEnv } from "./config/env";
import { startWorkers } from "./scheduler/worker";

async function start() {
  const env = loadEnv();
  const app = buildApp();

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);
    if (env.DISABLE_WORKERS) {
      app.log.info("Workers disabled; skipping Redis connections.");
    } else {
      await startWorkers();
    }
  } catch (error) {
    app.log.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

void start();
