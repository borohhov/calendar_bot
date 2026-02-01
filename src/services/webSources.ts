import type { WebSource } from "@prisma/client";
import { NotFoundError } from "../core/errors";
import { scheduleWebSourceCrawl, removeWebSourceCrawl } from "../scheduler/scheduler";
import {
  createWebSource as createWebSourceRepo,
  deleteWebSource as deleteWebSourceRepo,
  findWebSourceById,
  listWebSources as listWebSourcesRepo,
  updateWebSource as updateWebSourceRepo,
} from "../storage/repositories/webSourceRepository";
import { getOrCreateSingleUser } from "./users/singleUser";

export interface WebSourceInput {
  name?: string;
  url: string;
  crawlFrequencyMinutes: number;
}

export interface WebSourceUpdateInput {
  name?: string;
  crawlFrequencyMinutes?: number;
  status?: "active" | "paused";
}

export async function listWebSources(): Promise<WebSource[]> {
  const user = await getOrCreateSingleUser();
  return listWebSourcesRepo(user.id);
}

export async function createWebSource(input: WebSourceInput): Promise<WebSource> {
  const user = await getOrCreateSingleUser();
  const created = await createWebSourceRepo({
    user: { connect: { id: user.id } },
    name: input.name,
    url: input.url,
    crawlFrequencyMinutes: input.crawlFrequencyMinutes,
    status: "active",
  });

  await scheduleWebSourceCrawl(created.id, created.crawlFrequencyMinutes);
  return created;
}

export async function updateWebSource(id: string, updates: WebSourceUpdateInput): Promise<WebSource> {
  const existing = await findWebSourceById(id);
  if (!existing) throw new NotFoundError("Web source not found");

  const updated = await updateWebSourceRepo(id, updates);

  const wasActive = existing.status === "active";
  const isActive = updated.status === "active";
  const frequencyChanged = existing.crawlFrequencyMinutes !== updated.crawlFrequencyMinutes;

  if (wasActive && (frequencyChanged || !isActive)) {
    await removeWebSourceCrawl(existing.id, existing.crawlFrequencyMinutes);
  }

  if (isActive && (frequencyChanged || !wasActive)) {
    await scheduleWebSourceCrawl(updated.id, updated.crawlFrequencyMinutes);
  }

  return updated;
}

export async function deleteWebSource(id: string): Promise<WebSource> {
  const existing = await findWebSourceById(id);
  if (!existing) throw new NotFoundError("Web source not found");

  if (existing.status === "active") {
    await removeWebSourceCrawl(existing.id, existing.crawlFrequencyMinutes);
  }

  return deleteWebSourceRepo(id);
}
