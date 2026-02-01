import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  SUPPORT_EMAIL: z.string().email().default("support@ananda.bot"),
  WHATSAPP_PROVIDER_BASE_URL: z.string().url(),
  WHATSAPP_PROVIDER_TOKEN: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  DEFAULT_TIMEZONE: z.string().default("UTC"),
  LOG_LEVEL: z.string().default("info"),
  DISABLE_WORKERS: booleanFromEnv.default(false),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.errors.map((err) => err.message).join(", ");
    throw new Error(`Invalid environment: ${message}`);
  }

  if (!parsed.data.DISABLE_WORKERS && !parsed.data.REDIS_URL) {
    throw new Error("Invalid environment: REDIS_URL is required unless DISABLE_WORKERS=true");
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
