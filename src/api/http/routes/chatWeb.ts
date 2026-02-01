import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { ValidationError } from "../../../core/errors";
import { buildWebChatAnswer, type ChatQuestionRequest } from "../../../services/conversation/webChatService";
import { getOrCreateSingleUser } from "../../../services/users/singleUser";

let cachedChatHtml: string | null = null;

async function loadChatHtml(): Promise<string> {
  if (cachedChatHtml) return cachedChatHtml;
  const viewPath = join(process.cwd(), "src", "api", "http", "views", "chat.html");
  cachedChatHtml = await readFile(viewPath, "utf8");
  return cachedChatHtml;
}

export async function chatWebRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const html = await loadChatHtml();
    reply.type("text/html; charset=utf-8").send(html);
  });

  app.post("/messages", async (request) => {
    const payload = request.body as Partial<ChatQuestionRequest> | undefined;
    const question = payload?.question?.trim();

    if (!question) {
      throw new ValidationError("Question is required");
    }

    const user = await getOrCreateSingleUser();
    return buildWebChatAnswer(user, {
      question,
      timezone: payload?.timezone,
    });
  });
}
