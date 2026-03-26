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
    include: itemInclude,
  });

  return { items, typeName: itemType.name, typeColor: itemType.color };
}
