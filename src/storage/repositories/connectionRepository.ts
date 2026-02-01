import type { ChannelConnection, Prisma } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createConnection(data: Prisma.ChannelConnectionCreateInput): Promise<ChannelConnection> {
  return prisma.channelConnection.create({ data });
}

export async function updateConnection(
  id: string,
  data: Prisma.ChannelConnectionUpdateInput,
): Promise<ChannelConnection> {
  return prisma.channelConnection.update({ where: { id }, data });
}

export async function findConnectionById(id: string): Promise<ChannelConnection | null> {
  return prisma.channelConnection.findUnique({ where: { id } });
}

export async function listConnectionsByUser(userId: string): Promise<ChannelConnection[]> {
  return prisma.channelConnection.findMany({ where: { userId } });
}

export async function findActiveConnectionByUser(userId: string): Promise<ChannelConnection | null> {
  return prisma.channelConnection.findFirst({ where: { userId, status: "active" } });
}
