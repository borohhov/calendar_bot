import type { Preference } from "@prisma/client";
import { createPreference, getPreference, updatePreference } from "../../storage/repositories/preferenceRepository";
import { getOrCreateSingleUser } from "../users/singleUser";

export interface PreferenceInput {
  preferredCategories?: string[];
  preferredLocations?: string[];
  availabilityRules?: unknown;
  avoidTimes?: unknown;
}

export async function getUserPreferences(): Promise<Preference | null> {
  const user = await getOrCreateSingleUser();
  return getPreference(user.id);
}

export async function updateUserPreferences(input: PreferenceInput): Promise<Preference> {
  const user = await getOrCreateSingleUser();
  const existing = await getPreference(user.id);

  if (existing) {
    return updatePreference(existing.id, {
      preferredCategories: input.preferredCategories ?? existing.preferredCategories,
      preferredLocations: input.preferredLocations ?? existing.preferredLocations,
      availabilityRules: (input.availabilityRules as object | null) ?? existing.availabilityRules,
      avoidTimes: (input.avoidTimes as object | null) ?? existing.avoidTimes,
    });
  }

  return createPreference({
    user: { connect: { id: user.id } },
    preferredCategories: input.preferredCategories ?? [],
    preferredLocations: input.preferredLocations ?? [],
    availabilityRules: (input.availabilityRules as object | null) ?? null,
    avoidTimes: (input.avoidTimes as object | null) ?? null,
  });
}
