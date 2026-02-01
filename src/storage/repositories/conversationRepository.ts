import type { Conversation, Prisma } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createConversation(data: Prisma.ConversationCreateInput): Promise<Conversation> {
  return prisma.conversation.create({ data });
}

export async function updateConversation(
  id: string,
  data: Prisma.ConversationUpdateInput,
): Promise<Conversation> {
  return prisma.conversation.update({ where: { id }, data });
}

export async function findConversationById(id: string): Promise<Conversation | null> {
  return prisma.conversation.findUnique({ where: { id } });
}

export async function findConversationByConnection(
  userId: string,
  channelConnectionId: string,
): Promise<Conversation | null> {
  return prisma.conversation.findFirst({
    where: { userId, channelConnectionId },
    orderBy: { lastMessageAt: "desc" },
  });
}
