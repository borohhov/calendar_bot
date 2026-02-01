import type { CrawlJob, Prisma } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createCrawlJob(data: Prisma.CrawlJobCreateInput): Promise<CrawlJob> {
  return prisma.crawlJob.create({ data });
}

export async function findCrawlJobById(id: string): Promise<CrawlJob | null> {
  return prisma.crawlJob.findUnique({ where: { id } });
}

export async function updateCrawlJob(id: string, data: Prisma.CrawlJobUpdateInput): Promise<CrawlJob> {
  return prisma.crawlJob.update({ where: { id }, data });
}
