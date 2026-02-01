import { loadEnv } from "../../config/env";

const env = loadEnv();

function buildHeaders() {
  return {
    Authorization: `Bearer ${env.WHATSAPP_PROVIDER_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function createConnection(providerInstanceId: string, callbackUrl: string) {
  const response = await fetch(`${env.WHATSAPP_PROVIDER_BASE_URL}/connections`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ providerInstanceId, callbackUrl }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp provider error: ${response.status}`);
  }

  return response.json();
}

export async function revokeConnection(connectionId: string) {
  const response = await fetch(`${env.WHATSAPP_PROVIDER_BASE_URL}/connections/${connectionId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp provider error: ${response.status}`);
  }
}

export async function sendMessage(connectionId: string, to: string, body: string) {
  const response = await fetch(`${env.WHATSAPP_PROVIDER_BASE_URL}/connections/${connectionId}/messages`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ to, body }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp provider error: ${response.status}`);
  }

  return response.json();
}
