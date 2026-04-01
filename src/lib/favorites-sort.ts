import type { FavoriteItem, FavoriteCollection } from "@/lib/db/favorites";

export type SortKey = "date" | "name" | "type";

export function sortItems(list: FavoriteItem[], sort: SortKey): FavoriteItem[] {
  return [...list].sort((a, b) => {
    if (sort === "name") return a.title.localeCompare(b.title);
    if (sort === "type") return a.itemType.name.localeCompare(b.itemType.name);
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}

export function sortCollections(list: FavoriteCollection[], sort: SortKey): FavoriteCollection[] {
  return [...list].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "type") return a.dominantTypeName.localeCompare(b.dominantTypeName);
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}
