import { prisma } from "@/lib/db";
import type { ItemWithMeta } from "@/lib/db/items";

export type FavoriteItem = ItemWithMeta & { updatedAt: Date };

export type FavoriteCollection = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
  itemCount: number;
  dominantColor: string;
};

const itemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  lastUsedAt: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  createdAt: true,
  updatedAt: true,
  itemType: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { id: true, name: true } },
} as const;

export async function getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
  return prisma.item.findMany({
    where: { isFavorite: true, userId },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });
}

export async function getFavoriteCollections(userId: string): Promise<FavoriteCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { isFavorite: true, userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
      itemCollections: {
        select: {
          item: { select: { itemType: { select: { color: true } } } },
        },
      },
    },
  });

  return collections.map((col) => {
    const colorCount = new Map<string, number>();
    for (const ic of col.itemCollections) {
      const c = ic.item.itemType.color;
      colorCount.set(c, (colorCount.get(c) ?? 0) + 1);
    }
    let dominantColor = "#6b7280";
    let max = 0;
    for (const [color, count] of colorCount) {
      if (count > max) { max = count; dominantColor = color; }
    }
    return {
      id: col.id,
      name: col.name,
      description: col.description,
      updatedAt: col.updatedAt,
      itemCount: col.itemCollections.length,
      dominantColor,
    };
  });
}
