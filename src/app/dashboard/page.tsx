import Link from "next/link";
import {
  Layers,
  FolderOpen,
  Star,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/auth";
import { getCollections, getDashboardStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { DASHBOARD_COLLECTIONS_LIMIT, DASHBOARD_RECENT_ITEMS_LIMIT } from "@/lib/constants";
import CollectionCard from "@/components/collections/CollectionCard";
import ItemsWithDrawer from "@/components/items/ItemsWithDrawer";
import QuickActions from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isPro = session!.user.isPro ?? false;
  const [{ collections }, stats, pinnedItems, recentItems] = await Promise.all([
    getCollections(userId, { limit: DASHBOARD_COLLECTIONS_LIMIT }),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT),
  ]);

  const statCards = [
    { label: "Total Items", value: stats.totalItems, icon: Layers, color: "#3b82f6" },
    { label: "Collections", value: stats.totalCollections, icon: FolderOpen, color: "#8b5cf6" },
    { label: "Starred Items", value: stats.favoriteItems, icon: Star, color: "#f59e0b" },
    { label: "Starred Collections", value: stats.favoriteCollections, icon: BookMarked, color: "#10b981" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10">

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-white/6 bg-[#111113] p-5 flex flex-col gap-3 hover:border-white/10 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-white/90">{value}</p>
              <p className="text-xs text-white/35 mt-0.5 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white/85">Collections</h2>
            <p className="text-xs text-white/35 mt-0.5">Your organized resource groups</p>
          </div>
          <Link
            href="/dashboard/collections"
            className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors group"
          >
            View all
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        {collections.length === 0 ? (
          <div className="rounded-xl border border-white/5 border-dashed p-10 text-center">
            <FolderOpen className="h-8 w-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/30">No collections yet.</p>
            <p className="text-xs text-white/20 mt-1">Create one to group your items.</p>
          </div>
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
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white/85">Pinned</h2>
            <p className="text-xs text-white/35 mt-0.5">Your most important items</p>
          </div>
          <ItemsWithDrawer items={pinnedItems} className="space-y-2" isPro={isPro} />
        </section>
      )}

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white/85">Recent Items</h2>
            <p className="text-xs text-white/35 mt-0.5">Items you've used lately</p>
          </div>
          <ItemsWithDrawer items={recentItems} className="space-y-2" isPro={isPro} />
        </section>
      )}
    </div>
  );
}
