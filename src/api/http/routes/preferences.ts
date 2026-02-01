import type { FastifyInstance } from "fastify";
import { getUserPreferences, updateUserPreferences } from "../../../services/recommendations/preferencesService";

export async function preferenceRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return getUserPreferences();
  });

  app.put("/", async (request) => {
    const body = request.body as {
      preferredCategories?: string[];
      preferredLocations?: string[];
      availabilityRules?: unknown;
      avoidTimes?: unknown;
    };

    return updateUserPreferences(body);
  });
}
