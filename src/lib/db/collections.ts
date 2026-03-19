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

// TODO: replace with session.user.id once auth is set up
export async function getCollections(): Promise<CollectionWithMeta[]> {
  const collections = await prisma.collection.findMany({
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

// TODO: replace with session.user.id once auth is set up
export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count(),
      prisma.collection.count(),
      prisma.item.count({ where: { isFavorite: true } }),
      prisma.collection.count({ where: { isFavorite: true } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
