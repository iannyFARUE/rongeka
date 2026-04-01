import { prisma } from "@/lib/db";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";

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

function mapCollectionWithMeta(col: {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCollections: { item: { itemType: { id: string; name: string; icon: string; color: string } } }[];
}): CollectionWithMeta {
  const typeCount = new Map<string, CollectionType & { count: number }>();
  for (const ic of col.itemCollections) {
    const { id, name, icon, color } = ic.item.itemType;
    const existing = typeCount.get(id);
    if (existing) existing.count++;
    else typeCount.set(id, { id, name, icon, color, count: 1 });
  }
  const sortedTypes = Array.from(typeCount.values()).sort((a, b) => b.count - a.count);
  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    itemCount: col.itemCollections.length,
    types: sortedTypes.map(({ id, name, icon, color }) => ({ id, name, icon, color })),
    dominantColor: sortedTypes[0]?.color ?? "#6b7280",
  };
}

const collectionWithMetaInclude = {
  itemCollections: {
    include: { item: { include: { itemType: true } } },
  },
} as const;

export async function getCollections(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<{ collections: CollectionWithMeta[]; totalCount: number }> {
  const { page, limit } = options ?? {};
  const isPaginated = page !== undefined && limit !== undefined;

  const [totalCount, rows] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: collectionWithMetaInclude,
      ...(isPaginated ? { skip: (page! - 1) * limit!, take: limit } : { take: limit }),
    }),
  ]);

  return { collections: rows.map(mapCollectionWithMeta), totalCount };
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

export async function getSimpleCollections(
  userId: string
): Promise<{ id: string; name: string }[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  dominantColor: string;
  totalItems: number;
  items: {
    id: string;
    title: string;
    description: string | null;
    isFavorite: boolean;
    isPinned: boolean;
    lastUsedAt: Date | null;
    content: string | null;
    url: string | null;
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    createdAt: Date;
    itemType: { id: string; name: string; icon: string; color: string };
    tags: { id: string; name: string }[];
  }[];
};

export async function getCollectionWithItems(
  userId: string,
  collectionId: string,
  page = 1
): Promise<CollectionDetail | null> {
  // Fetch collection metadata + lightweight type info for dominant color
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      itemCollections: {
        select: {
          item: { select: { itemType: { select: { id: true, color: true } } } },
        },
      },
    },
  });

  if (!collection) return null;

  // Compute dominant color from all items (lightweight)
  const typeCount = new Map<string, { color: string; count: number }>();
  for (const ic of collection.itemCollections) {
    const { id, color } = ic.item.itemType;
    const existing = typeCount.get(id);
    if (existing) existing.count++;
    else typeCount.set(id, { color, count: 1 });
  }
  const sortedTypes = Array.from(typeCount.values()).sort((a, b) => b.count - a.count);
  const dominantColor = sortedTypes[0]?.color ?? "#6b7280";
  const totalItems = collection.itemCollections.length;

  // Fetch paginated items
  const paginatedIcs = await prisma.itemCollection.findMany({
    where: { collectionId, item: { userId } },
    orderBy: { addedAt: "desc" },
    skip: (page - 1) * COLLECTIONS_PER_PAGE,
    take: COLLECTIONS_PER_PAGE,
    include: {
      item: {
        include: {
          itemType: { select: { id: true, name: true, icon: true, color: true } },
          tags: { select: { id: true, name: true } },
        },
      },
    },
  });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    dominantColor,
    totalItems,
    items: paginatedIcs.map((ic) => ({
      id: ic.item.id,
      title: ic.item.title,
      description: ic.item.description,
      isFavorite: ic.item.isFavorite,
      isPinned: ic.item.isPinned,
      lastUsedAt: ic.item.lastUsedAt,
      content: ic.item.content,
      url: ic.item.url,
      fileUrl: ic.item.fileUrl,
      fileName: ic.item.fileName,
      fileSize: ic.item.fileSize,
      createdAt: ic.item.createdAt,
      itemType: ic.item.itemType,
      tags: ic.item.tags,
    })),
  };
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name: string; description?: string | null }
) {
  return prisma.collection.update({
    where: { id: collectionId, userId },
    data: { name: data.name, description: data.description ?? null },
  });
}

export async function toggleFavoriteCollection(
  userId: string,
  collectionId: string
): Promise<{ isFavorite: boolean } | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { isFavorite: true },
  });
  if (!collection) return null;
  const updated = await prisma.collection.update({
    where: { id: collectionId, userId },
    data: { isFavorite: !collection.isFavorite },
    select: { isFavorite: true },
  });
  return updated;
}

export async function deleteCollection(userId: string, collectionId: string) {
  return prisma.collection.delete({
    where: { id: collectionId, userId },
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
