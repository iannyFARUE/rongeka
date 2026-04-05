"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderPlus, Star, Menu, Zap } from "lucide-react";
import NewItemDialog from "@/components/items/NewItemDialog";
import NewCollectionDialog from "@/components/collections/NewCollectionDialog";

export default function TopBar({ onSearchClick, onMenuClick, isPro }: { onSearchClick?: () => void; onMenuClick?: () => void; isPro?: boolean }) {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-4 h-12 border-b border-border bg-background shrink-0">
        <Button size="sm" variant="ghost" className="md:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
          <span className="text-xl">⚡</span>
          <span className="text-base">Rongeka</span>
        </Link>
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="topbar-search"
            placeholder="Search... ⌘K"
            className="pl-9 pr-4 cursor-pointer"
            readOnly
            onClick={onSearchClick}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isPro && (
            <Link href="/dashboard/upgrade">
              <Button size="sm" variant="outline" className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            </Link>
          )}
          <Link href="/dashboard/favorites">
            <Button size="sm" variant="ghost" aria-label="Favorites">
              <Star className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => setCollectionDialogOpen(true)} aria-label="New Collection">
            <FolderPlus className="h-4 w-4" />
            <span className="hidden md:inline">New Collection</span>
          </Button>
          <Button size="sm" onClick={() => setItemDialogOpen(true)} aria-label="New Item">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New Item</span>
          </Button>
        </div>
      </header>

      <NewItemDialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} />
      <NewCollectionDialog open={collectionDialogOpen} onClose={() => setCollectionDialogOpen(false)} />
    </>
  );
}
