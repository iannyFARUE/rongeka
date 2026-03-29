import { prisma } from "@/lib/db";

export type CollectionType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type CollectionWithMeta = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  types: CollectionType[];
  dominantColor: string;
};

export type DashboardStats = {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
};

export async function getCollections(userId: string): Promise<CollectionWithMeta[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      itemCollections: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const items = col.itemCollections.map((ic) => ic.item);

    // Count occurrences of each item type
    const typeCount = new Map<
      string,
      CollectionType & { count: number }
    >();
    for (const item of items) {
      const { id, name, icon, color } = item.itemType;
      const existing = typeCount.get(id);
      if (existing) {
        existing.count++;
      } else {
        typeCount.set(id, { id, name, icon, color, count: 1 });
      }
    }

    const sortedTypes = Array.from(typeCount.values()).sort(
      (a, b) => b.count - a.count
    );

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: items.length,
      types: sortedTypes.map(({ id, name, icon, color }) => ({
        id,
        name,
        icon,
        color,
      })),
      dominantColor: sortedTypes[0]?.color ?? "#6b7280",
    };
  });
}

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null }
) {
  return prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
  });
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { isFavorite: true, userId } }),
      prisma.collection.count({ where: { isFavorite: true, userId } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
