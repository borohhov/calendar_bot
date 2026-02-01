import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../core/errors";
import { logger } from "../../observability/logger";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
        details: error.details,
      });
      return;
    }

    logger.error({ err: error }, "Unhandled error");
    reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Unexpected error",
    });
  });
}
