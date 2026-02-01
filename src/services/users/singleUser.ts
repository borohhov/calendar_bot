import { loadEnv } from "../../config/env";
import { createUser, findFirstUser } from "../../storage/repositories/userRepository";

const DEFAULT_PHONE = "local-user";

export async function getOrCreateSingleUser() {
  const existing = await findFirstUser();
  if (existing) return existing;

  const env = loadEnv();
  return createUser({
    phone: DEFAULT_PHONE,
    displayName: "Local User",
    timezone: env.DEFAULT_TIMEZONE,
  });
}
