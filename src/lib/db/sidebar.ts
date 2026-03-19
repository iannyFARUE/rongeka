import { prisma } from "@/lib/db";

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
};

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantColor: string;
};

export type SidebarRecentItem = {
  id: string;
  title: string;
  itemType: { icon: string; color: string };
};

export type SidebarData = {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  recentItems: SidebarRecentItem[];
};

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [itemTypes, collections, recentItems] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: { _count: { select: { items: true } } },
    }),

    prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        itemCollections: {
          include: { item: { include: { itemType: true } } },
        },
      },
    }),

    prisma.item.findMany({
      where: { lastUsedAt: { not: null }, userId },
      orderBy: { lastUsedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        itemType: { select: { icon: true, color: true } },
      },
    }),
  ]);

  const mappedCollections: SidebarCollection[] = collections.map((col) => {
    const typeCount = new Map<string, { color: string; count: number }>();
    for (const ic of col.itemCollections) {
      const { id, color } = ic.item.itemType;
      const existing = typeCount.get(id);
      if (existing) {
        existing.count++;
      } else {
        typeCount.set(id, { color, count: 1 });
      }
    }
    const dominant = Array.from(typeCount.values()).sort(
      (a, b) => b.count - a.count
    )[0];

    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      dominantColor: dominant?.color ?? "#6b7280",
    };
  });

  const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

  return {
    itemTypes: itemTypes
      .map((t) => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        color: t.color,
        itemCount: t._count.items,
      }))
      .sort(
        (a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name)
      ),
    collections: mappedCollections,
    recentItems,
  };
}
