"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 h-12 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-2 font-semibold text-foreground shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          R
        </div>
        <span className="text-base">Rongeka</span>
      </div>
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="topbar-search"
          placeholder="Search items, collections, tags..."
          className="pl-9 pr-16"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          <span>⌘</span>K
        </kbd>
      </div>
      <Button size="sm" className="shrink-0">
        <Plus className="h-4 w-4" />
        New Item
      </Button>
    </header>
  );
}
