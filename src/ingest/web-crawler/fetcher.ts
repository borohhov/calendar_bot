import { createHash } from "crypto";

export interface FetchResult {
  url: string;
  ok: boolean;
  status: number;
  contentType?: string;
  body?: string;
  contentHash?: string;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 2_000_000;

export async function fetchHtml(url: string, timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = DEFAULT_MAX_BYTES): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const contentType = response.headers.get("content-type") ?? undefined;

    if (!response.ok) {
      return { url, ok: false, status: response.status, contentType, error: `HTTP ${response.status}` };
    }

    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader) {
      const length = Number(contentLengthHeader);
      if (!Number.isNaN(length) && length > maxBytes) {
        return { url, ok: false, status: response.status, contentType, error: "Content too large" };
      }
    }

    const body = await response.text();
    if (body.length > maxBytes) {
      return { url, ok: false, status: response.status, contentType, error: "Content too large" };
    }

    const contentHash = createHash("sha256").update(body).digest("hex");

    return { url, ok: true, status: response.status, contentType, body, contentHash };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return { url, ok: false, status: 0, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
