import type { Conversation } from "@prisma/client";
import { findConversationByConnection, createConversation, updateConversation } from "../../storage/repositories/conversationRepository";

export interface ConversationContext {
  lastRange?: {
    start: string;
    end: string;
  };
  awaitingDateRange?: boolean;
  lastQuestion?: string;
}

export async function getOrCreateConversation(userId: string, channelConnectionId: string): Promise<Conversation> {
  const existing = await findConversationByConnection(userId, channelConnectionId);
  if (existing) return existing;

  return createConversation({
    user: { connect: { id: userId } },
    channelConnection: { connect: { id: channelConnectionId } },
    startedAt: new Date(),
    lastMessageAt: new Date(),
    contextJson: {},
  });
}

export async function updateConversationContext(
  conversation: Conversation,
  context: ConversationContext,
): Promise<Conversation> {
  return updateConversation(conversation.id, {
    lastMessageAt: new Date(),
    contextJson: context,
  });
}

export function readConversationContext(conversation: Conversation): ConversationContext {
  return (conversation.contextJson as ConversationContext) ?? {};
}
