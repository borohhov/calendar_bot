import type { FastifyInstance } from "fastify";
import { exportEvents } from "../../../services/events/eventQueryService";
import { getOrCreateSingleUser } from "../../../services/users/singleUser";

export async function eventExportRoutes(app: FastifyInstance) {
  app.post("/", async () => {
    const user = await getOrCreateSingleUser();
    return exportEvents(user.id);
  });
}
