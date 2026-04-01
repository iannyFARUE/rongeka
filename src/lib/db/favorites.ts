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
  dominantTypeName: string;
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
          item: { select: { itemType: { select: { color: true, name: true } } } },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCount = new Map<string, { count: number; color: string; name: string }>();
    for (const ic of col.itemCollections) {
      const { color, name } = ic.item.itemType;
      const entry = typeCount.get(name);
      if (entry) { entry.count++; } else { typeCount.set(name, { count: 1, color, name }); }
    }
    let dominantColor = "#6b7280";
    let dominantTypeName = "";
    let max = 0;
    for (const entry of typeCount.values()) {
      if (entry.count > max) { max = entry.count; dominantColor = entry.color; dominantTypeName = entry.name; }
    }
    return {
      id: col.id,
      name: col.name,
      description: col.description,
      updatedAt: col.updatedAt,
      itemCount: col.itemCollections.length,
      dominantColor,
      dominantTypeName,
    };
  });
}
