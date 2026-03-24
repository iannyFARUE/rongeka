import { prisma } from "@/lib/db";

export type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  hasPassword: boolean;
  createdAt: Date;
  totalItems: number;
  totalCollections: number;
  itemTypeCounts: { name: string; icon: string; color: string; count: number }[];
};

export async function getProfileData(userId: string): Promise<ProfileData> {
  const [user, totalItems, totalCollections, itemTypeCounts] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
        createdAt: true,
      },
    }),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
    }),
  ]);

  const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: user.password !== null,
    createdAt: user.createdAt,
    totalItems,
    totalCollections,
    itemTypeCounts: itemTypeCounts
      .map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
        count: t._count.items,
      }))
      .sort((a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name)),
  };
}
