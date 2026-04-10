"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Folder, Search } from "lucide-react";
import { ICON_MAP } from "@/lib/item-icons";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import ItemDrawer from "@/components/items/ItemDrawer";
import type { SearchData } from "@/lib/db/search";


interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  searchData: SearchData;
}

export default function CommandPalette({ open, onClose, searchData }: CommandPaletteProps) {
  const router = useRouter();
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleSelectItem(id: string) {
    onClose();
    setDrawerItemId(id);
    setDrawerOpen(true);
  }

  function handleSelectCollection(id: string) {
    onClose();
    router.push(`/dashboard/collections/${id}`);
  }

  const palette = open ? (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden">
        <Command>
          <div className="flex items-center border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-2" />
            <CommandInput
              placeholder="Search items and collections..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 text-sm"
            />
          </div>
          <CommandList className="max-h-80">
            <CommandEmpty>No results found.</CommandEmpty>

            {searchData.items.length > 0 && (
              <CommandGroup heading="Items">
                {searchData.items.map((item) => {
                  const Icon = ICON_MAP[item.typeIcon] ?? File;
                  return (
                    <CommandItem
                      key={item.id}
                      value={`item ${item.title} ${item.typeName}`}
                      onSelect={() => handleSelectItem(item.id)}
                    >
                      <Icon className="shrink-0" style={{ color: item.typeColor }} />
                      <span className="truncate">{item.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize shrink-0">
                        {item.typeName}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {searchData.items.length > 0 && searchData.collections.length > 0 && (
              <CommandSeparator />
            )}

            {searchData.collections.length > 0 && (
              <CommandGroup heading="Collections">
                {searchData.collections.map((col) => (
                  <CommandItem
                    key={col.id}
                    value={`collection ${col.name}`}
                    onSelect={() => handleSelectCollection(col.id)}
                  >
                    <Folder className="shrink-0 text-muted-foreground" />
                    <span className="truncate">{col.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </div>
  ) : null;

  return (
    <>
      {typeof window !== "undefined" && palette
        ? createPortal(palette, document.body)
        : null}

      <ItemDrawer
        itemId={drawerItemId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
