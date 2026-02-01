import type { CrawlPage, Prisma } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createCrawlPage(data: Prisma.CrawlPageCreateInput): Promise<CrawlPage> {
  return prisma.crawlPage.create({ data });
}

export async function updateCrawlPage(id: string, data: Prisma.CrawlPageUpdateInput): Promise<CrawlPage> {
  return prisma.crawlPage.update({ where: { id }, data });
}

export async function listCrawlPagesByJob(crawlJobId: string): Promise<CrawlPage[]> {
  return prisma.crawlPage.findMany({ where: { crawlJobId } });
}
