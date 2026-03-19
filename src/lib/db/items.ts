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

// TODO: filter by userId once auth is set up
export async function getPinnedItems(): Promise<ItemWithMeta[]> {
  return prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: itemInclude,
  });
}

// TODO: filter by userId once auth is set up
export async function getRecentItems(limit = 10): Promise<ItemWithMeta[]> {
  return prisma.item.findMany({
    orderBy: { lastUsedAt: "desc" },
    take: limit,
    include: itemInclude,
  });
}
