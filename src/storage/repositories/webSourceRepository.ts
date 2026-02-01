import type { Prisma, WebSource } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createWebSource(data: Prisma.WebSourceCreateInput): Promise<WebSource> {
  return prisma.webSource.create({ data });
}

export async function listWebSources(userId: string): Promise<WebSource[]> {
  return prisma.webSource.findMany({ where: { userId } });
}

export async function findWebSourceById(id: string): Promise<WebSource | null> {
  return prisma.webSource.findUnique({ where: { id } });
}

export async function updateWebSource(id: string, data: Prisma.WebSourceUpdateInput): Promise<WebSource> {
  return prisma.webSource.update({ where: { id }, data });
}

export async function deleteWebSource(id: string): Promise<WebSource> {
  return prisma.webSource.delete({ where: { id } });
}
