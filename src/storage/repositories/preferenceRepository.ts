import type { Preference, Prisma } from "@prisma/client";
import { getPrismaClient } from "../prisma";

const prisma = getPrismaClient();

export async function createPreference(data: Prisma.PreferenceCreateInput): Promise<Preference> {
  return prisma.preference.create({ data });
}

export async function updatePreference(id: string, data: Prisma.PreferenceUpdateInput): Promise<Preference> {
  return prisma.preference.update({ where: { id }, data });
}

export async function getPreference(userId: string): Promise<Preference | null> {
  return prisma.preference.findUnique({ where: { userId } });
}
