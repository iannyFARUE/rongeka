import { prisma } from "@/lib/db";

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  contentType: "TEXT" | "FILE" | "URL";
  content: string | null;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
  itemCollections: {
    collection: { id: string; name: string };
  }[];
};

export type ItemWithMeta = {
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
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
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
  itemType: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { id: true, name: true } },
} as const;

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  return prisma.item.findMany({
    where: { isPinned: true, userId },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  return prisma.item.findMany({
    where: { lastUsedAt: { not: null }, userId },
    orderBy: { lastUsedAt: "desc" },
    take: limit,
    select: itemSelect,
  });
}

export async function getItemsByType(
  userId: string,
  typeSlug: string
): Promise<{ items: ItemWithMeta[]; typeName: string; typeColor: string } | null> {
  const slugToName: Record<string, string> = {
    snippets: "snippet",
    prompts: "prompt",
    commands: "command",
    notes: "note",
    files: "file",
    images: "image",
    links: "link",
  };

  const typeName = slugToName[typeSlug];
  if (!typeName) return null;

  const itemType = await prisma.itemType.findFirst({
    where: { name: typeName },
    select: { id: true, name: true, color: true },
  });
  if (!itemType) return null;

  const items = await prisma.item.findMany({
    where: { userId, itemTypeId: itemType.id },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });

  return { items, typeName: itemType.name, typeColor: itemType.color };
}

export async function getItemById(
  userId: string,
  id: string
): Promise<ItemDetail | null> {
  return prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { select: { id: true, name: true } },
      itemCollections: {
        include: {
          collection: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function deleteItem(
  userId: string,
  id: string
): Promise<{ fileUrl: string | null } | null> {
  try {
    const deleted = await prisma.item.delete({
      where: { id, userId },
      select: { fileUrl: true },
    });
    return deleted;
  } catch {
    return null;
  }
}

export type CreateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  typeName: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  collectionIds: string[];
};

export async function createItem(
  userId: string,
  data: CreateItemData
): Promise<ItemDetail | null> {
  const itemType = await prisma.itemType.findFirst({
    where: { name: data.typeName, isSystem: true },
    select: { id: true },
  });
  if (!itemType) return null;

  const FILE_ITEM_TYPES = new Set(["file", "image"]);
  const contentType = data.typeName === "link"
    ? "URL"
    : FILE_ITEM_TYPES.has(data.typeName)
    ? "FILE"
    : "TEXT";

  return prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      contentType,
      userId,
      itemTypeId: itemType.id,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      itemCollections: data.collectionIds.length > 0 ? {
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
      } : undefined,
    },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { select: { id: true, name: true } },
      itemCollections: {
        include: {
          collection: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
};

export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const updated = await prisma.$transaction(async (tx) => {
    // Verify ownership before modifying — throws if item not found or userId mismatch
    await tx.item.findFirstOrThrow({ where: { id, userId }, select: { id: true } });

    await tx.itemCollection.deleteMany({ where: { itemId: id } });

    return tx.item.update({
      where: { id, userId },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        language: data.language,
        tags: {
          set: [],
          connectOrCreate: data.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        itemCollections: data.collectionIds.length > 0 ? {
          create: data.collectionIds.map((collectionId) => ({ collectionId })),
        } : undefined,
      },
      include: {
        itemType: { select: { id: true, name: true, icon: true, color: true } },
        tags: { select: { id: true, name: true } },
        itemCollections: {
          include: {
            collection: { select: { id: true, name: true } },
          },
        },
      },
    });
  });
  return updated;
}
