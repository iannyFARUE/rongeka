"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link, Folder,
  type LucideIcon,
} from "lucide-react";
import ItemDrawer from "@/components/items/ItemDrawer";
import type { FavoriteItem, FavoriteCollection } from "@/lib/db/favorites";

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

interface FavoritesListProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export default function FavoritesList({ items, collections }: FavoritesListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  function openItem(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  const hasItems = items.length > 0;
  const hasCollections = collections.length > 0;

  if (!hasItems && !hasCollections) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-sm text-muted-foreground">No favorites yet.</p>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Star items or collections to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {hasItems && (
          <section>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              Items <span className="ml-1 opacity-60">({items.length})</span>
            </p>
            <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
              {items.map((item) => {
                const Icon = ICON_MAP[item.itemType.icon];
                return (
                  <button
                    key={item.id}
                    onClick={() => openItem(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/10 transition-colors text-left group"
                  >
                    {Icon && (
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: item.itemType.color }}
                      />
                    )}
                    <span className="font-mono text-sm truncate flex-1">{item.title}</span>
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: `${item.itemType.color}22`,
                        color: item.itemType.color,
                      }}
                    >
                      {item.itemType.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums w-20 text-right">
                      {formatDate(item.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {hasCollections && (
          <section>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
              Collections <span className="ml-1 opacity-60">({collections.length})</span>
            </p>
            <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => router.push(`/dashboard/collections/${col.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/10 transition-colors text-left group"
                >
                  <Folder
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: col.dominantColor }}
                  />
                  <span className="font-mono text-sm truncate flex-1">{col.name}</span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums w-20 text-right">
                    {formatDate(col.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ItemDrawer itemId={selectedId} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
