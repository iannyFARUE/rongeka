import { auth } from "@/auth";
import { getFavoriteItems, getFavoriteCollections } from "@/lib/db/favorites";
import FavoritesList from "@/components/favorites/FavoritesList";

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isPro = session!.user.isPro ?? false;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-mono text-lg font-semibold mb-6">Favorites</h1>
      <FavoritesList items={items} collections={collections} isPro={isPro} />
    </div>
  );
}
