import { loadEnv } from "../../config/env";

interface OpenAIResponseContent {
  type: string;
  text?: string;
}

interface OpenAIResponseItem {
  type: string;
  content?: OpenAIResponseContent[];
}

interface OpenAIResponsePayload {
  output?: OpenAIResponseItem[];
}

interface JsonSchemaFormat {
  name: string;
  schema: Record<string, unknown>;
  description?: string;
  strict?: boolean;
}

interface JsonResponseOptions {
  input: string;
  instructions: string;
  schema: JsonSchemaFormat;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

const OPENAI_URL = "https://api.openai.com/v1/responses";

export async function requestJsonResponse<T>(options: JsonResponseOptions): Promise<T> {
  const env = loadEnv();
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to use the LLM");
  }

  const body = {
    model: options.model ?? env.OPENAI_MODEL,
    input: options.input,
    instructions: options.instructions,
    temperature: options.temperature ?? 0.2,
    max_output_tokens: options.maxOutputTokens ?? 400,
    text: {
      format: {
        type: "json_schema",
        name: options.schema.name,
        schema: options.schema.schema,
        description: options.schema.description,
        strict: options.schema.strict ?? true,
      },
    },
  };

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as OpenAIResponsePayload & {
    error?: { message?: string };
  };

  if (!response.ok) {
    const message = payload?.error?.message ?? "OpenAI request failed";
    throw new Error(message);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI response contained no output text");
  }

  return JSON.parse(outputText) as T;
}

function extractOutputText(payload: OpenAIResponsePayload): string {
  if (!payload.output) return "";
  const chunks: string[] = [];
  for (const item of payload.output) {
    if (item.type !== "message" || !item.content) continue;
    for (const content of item.content) {
      if (content.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("").trim();
}
