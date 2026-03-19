import { prisma } from "@/lib/db";

export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt: Date | null;
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
};

const itemInclude = {
  itemType: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { id: true, name: true } },
} as const;

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  return prisma.item.findMany({
    where: { isPinned: true, userId },
    orderBy: { updatedAt: "desc" },
    include: itemInclude,
  });
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  return prisma.item.findMany({
    where: { lastUsedAt: { not: null }, userId },
    orderBy: { lastUsedAt: "desc" },
    take: limit,
    include: itemInclude,
  });
}
