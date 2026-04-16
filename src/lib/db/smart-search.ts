import { prisma } from "@/lib/db";
import type { ItemWithMeta } from "@/lib/db/items";

export type SmartSearchFilters = {
  keywords: string[];
  typeFilter?: string;
  tagFilters?: string[];
  daysAgo?: number;
};

const smartItemSelect = {
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

export async function smartSearchItems(
  userId: string,
  filters: SmartSearchFilters
): Promise<ItemWithMeta[]> {
  const { keywords, typeFilter, tagFilters, daysAgo } = filters;

  // Build keyword conditions — each keyword must match title OR content
  const keywordConditions = keywords
    .filter((kw) => kw.trim().length > 0)
    .map((kw) => ({
      OR: [
        { title: { contains: kw, mode: "insensitive" as const } },
        { content: { contains: kw, mode: "insensitive" as const } },
      ],
    }));

  return prisma.item.findMany({
    where: {
      userId,
      ...(keywordConditions.length > 0 && { AND: keywordConditions }),
      ...(typeFilter && { itemType: { name: typeFilter } }),
      ...(tagFilters && tagFilters.length > 0 && {
        tags: { some: { name: { in: tagFilters } } },
      }),
      ...(daysAgo && {
        createdAt: { gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) },
      }),
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: smartItemSelect,
  });
}
