import { Queue } from "bullmq";
import IORedis from "ioredis";
import { loadEnv } from "../config/env";

const env = loadEnv();

export const redisConnection = new IORedis(env.REDIS_URL);

export const webCrawlQueue = new Queue("web-crawl", {
  connection: redisConnection,
});

export const deadLetterQueue = new Queue("dead-letter", {
  connection: redisConnection,
});
