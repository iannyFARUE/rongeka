import {
  Layers,
  FolderOpen,
  Star,
  BookMarked,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/auth";
import { getCollections, getDashboardStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import CollectionCard from "@/components/collections/CollectionCard";
import ItemsWithDrawer from "@/components/items/ItemsWithDrawer";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getCollections(userId),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

  const statCards = [
    { label: "Items", value: stats.totalItems, icon: Layers, color: "#3b82f6" },
    { label: "Collections", value: stats.totalCollections, icon: FolderOpen, color: "#8b5cf6" },
    { label: "Favorite Items", value: stats.favoriteItems, icon: Star, color: "#fde047" },
    { label: "Favorite Collections", value: stats.favoriteCollections, icon: BookMarked, color: "#10b981" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Collections</h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View All
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4">Pinned</h2>
          <ItemsWithDrawer items={pinnedItems} className="space-y-2" />
        </section>
      )}

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4">Recent Items</h2>
          <ItemsWithDrawer items={recentItems} className="space-y-2" />
        </section>
      )}
    </div>
  );
}
