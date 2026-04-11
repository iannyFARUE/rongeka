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
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-white/5 bg-[#0D0D0F] shrink-0">
        {/* Mobile menu */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors shrink-0"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Left spacer */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {!isPro && (
            <Link href="/dashboard/upgrade">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/8 hover:border-white/15 text-xs font-medium"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Search trigger — centered */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2.5 flex-1 max-w-md mx-auto h-9 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/18 text-white/40 hover:text-white/60 transition-all text-sm shadow-sm"
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
            className="h-8 bg-white hover:bg-white/90 text-[#09090B] border-0 gap-1.5 text-xs font-medium"
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
