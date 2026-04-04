import { prisma } from "@/lib/db";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "@/lib/constants";

export async function hasReachedItemLimit(userId: string): Promise<boolean> {
  const count = await prisma.item.count({ where: { userId } });
  return count >= FREE_TIER_ITEM_LIMIT;
}

export async function hasReachedCollectionLimit(userId: string): Promise<boolean> {
  const count = await prisma.collection.count({ where: { userId } });
  return count >= FREE_TIER_COLLECTION_LIMIT;
}

export const PRO_ONLY_ITEM_TYPES = new Set(["file", "image"]);

export function isProOnlyType(typeName: string): boolean {
  return PRO_ONLY_ITEM_TYPES.has(typeName);
}
