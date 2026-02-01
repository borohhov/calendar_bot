import type { ChannelConnection } from "@prisma/client";
import { NotFoundError } from "../core/errors";
import {
  createConnection as createConnectionRepo,
  findConnectionById,
  updateConnection,
} from "../storage/repositories/connectionRepository";
import { getOrCreateSingleUser } from "./users/singleUser";
import * as whatsappClient from "../connectors/whatsapp/client";

export interface WhatsAppConnectionInput {
  providerInstanceId: string;
  callbackUrl: string;
}

export async function createWhatsAppConnection(input: WhatsAppConnectionInput): Promise<ChannelConnection> {
  const user = await getOrCreateSingleUser();
  const providerResponse = await whatsappClient.createConnection(input.providerInstanceId, input.callbackUrl);

  const providerConnectionId =
    providerResponse?.id ?? providerResponse?.connectionId ?? input.providerInstanceId;

  return createConnectionRepo({
    user: { connect: { id: user.id } },
    channelType: "whatsapp",
    provider: "evolution",
    status: "active",
    authMetadata: {
      providerInstanceId: input.providerInstanceId,
      providerConnectionId,
      providerResponse,
    },
  });
}

export async function revokeWhatsAppConnection(connectionId: string): Promise<void> {
  const existing = await findConnectionById(connectionId);
  if (!existing) throw new NotFoundError("Connection not found");

  const metadata = (existing.authMetadata ?? {}) as Record<string, unknown>;
  const providerConnectionId = (metadata.providerConnectionId as string) ?? existing.id;

  await whatsappClient.revokeConnection(providerConnectionId);
  await updateConnection(existing.id, { status: "revoked", revokedAt: new Date() });
}
