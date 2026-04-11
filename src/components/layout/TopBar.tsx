"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Plus, FolderPlus, Star, Menu, Zap } from "lucide-react";
import NewItemDialog from "@/components/items/NewItemDialog";
import NewCollectionDialog from "@/components/collections/NewCollectionDialog";

export default function TopBar({
  onSearchClick,
  onMenuClick,
  isPro,
}: {
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  isPro?: boolean;
}) {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-4 h-[52px] border-b border-white/5 bg-[#0D0D0F] shrink-0">
        {/* Mobile menu */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search trigger */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2.5 flex-1 max-w-sm h-8 px-3 rounded-lg border border-white/8 bg-white/4 hover:bg-white/6 hover:border-white/12 text-white/35 hover:text-white/50 transition-all text-sm"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search items and collections…</span>
          <kbd className="shrink-0 text-[10px] bg-white/8 text-white/30 px-1.5 py-0.5 rounded font-mono hidden sm:block">
            ⌘K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isPro && (
            <Link href="/dashboard/upgrade">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/30 text-xs font-medium"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            </Link>
          )}

          <Link href="/dashboard/favorites">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Favorites"
              className="h-8 text-white/50 hover:text-white/80 hover:bg-white/5 gap-1.5 text-xs"
            >
              <Star className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Favorites</span>
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCollectionDialogOpen(true)}
            aria-label="New Collection"
            className="h-8 text-white/50 hover:text-white/80 hover:bg-white/5 gap-1.5 border border-white/8 hover:border-white/15 text-xs"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Collection</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setItemDialogOpen(true)}
            aria-label="New Item"
            className="h-8 bg-violet-600 hover:bg-violet-500 text-white border-0 gap-1.5 text-xs font-medium shadow-lg shadow-violet-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Item</span>
          </Button>
        </div>
      </header>

      <NewItemDialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} />
      <NewCollectionDialog open={collectionDialogOpen} onClose={() => setCollectionDialogOpen(false)} />
    </>
  );
}
