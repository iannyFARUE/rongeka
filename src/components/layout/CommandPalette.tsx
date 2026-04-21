"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Folder, Sparkles, Crown, Loader2 } from "lucide-react";
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
import type { ItemWithMeta } from "@/lib/db/items";


interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  searchData: SearchData;
  isPro: boolean;
}

export default function CommandPalette({ open, onClose, searchData, isPro }: CommandPaletteProps) {
  const router = useRouter();
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // AI smart search state
  const [aiEnabled, setAiEnabled] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResults, setAiResults] = useState<ItemWithMeta[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when palette closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setAiResults([]);
      setAiLoading(false);
    }
  }, [open]);

  // Debounced AI search
  const runAiSearch = useCallback(async (q: string) => {
    if (q.length < 3) {
      setAiResults([]);
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.results ?? []);
      } else {
        setAiResults([]);
      }
    } catch {
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!aiEnabled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAiSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, aiEnabled, runAiSearch]);

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

  const aiToggle = isPro ? (
    <button
      type="button"
      onClick={() => {
        setAiEnabled((prev) => !prev);
        setAiResults([]);
      }}
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
        aiEnabled
          ? "bg-violet-500/20 text-violet-400 border border-violet-500/40"
          : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
      }`}
      title={aiEnabled ? "Disable AI search" : "Enable AI search"}
    >
      <Sparkles className="h-3 w-3" />
      AI
    </button>
  ) : (
    <span
      title="Smart Search is a Pro feature"
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground/50 cursor-not-allowed border border-transparent"
    >
      <Crown className="h-3 w-3" />
      AI
    </span>
  );

  const palette = open ? (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden">
        <Command shouldFilter={!aiEnabled}>
          <div className="relative">
            <CommandInput
              placeholder={aiEnabled ? "Ask anything… e.g. Redis caching snippet from last week" : "Search items and collections..."}
              value={query}
              onValueChange={setQuery}
              className={aiEnabled ? "pr-16" : "pr-12"}
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              {aiEnabled && aiLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              {aiToggle}
            </div>
          </div>
          <CommandList className="max-h-80">
            <CommandEmpty>No results found.</CommandEmpty>

            {/* AI Smart Results */}
            {aiEnabled && !aiLoading && aiResults.length > 0 && (
              <>
                <CommandGroup heading="Smart Results">
                  {aiResults.map((item) => {
                    const Icon = ICON_MAP[item.itemType.icon] ?? Folder;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`ai-${item.id}`}
                        onSelect={() => handleSelectItem(item.id)}
                      >
                        <Icon className="shrink-0" style={{ color: item.itemType.color }} />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{item.title}</span>
                          {item.tags.length > 0 && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {item.tags.map((t) => `#${t.name}`).join("  ")}
                            </span>
                          )}
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground capitalize shrink-0 pl-2">
                          {item.itemType.name}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Regular cmdk results */}
            {searchData.items.length > 0 && (
              <CommandGroup heading={aiEnabled ? "All Items" : "Items"}>
                {searchData.items.map((item) => {
                  const Icon = ICON_MAP[item.typeIcon] ?? Folder;
                  return (
                    <CommandItem
                      key={item.id}
                      value={`item ${item.title} ${item.typeName} ${item.tags.join(" ")}`}
                      onSelect={() => handleSelectItem(item.id)}
                    >
                      <Icon className="shrink-0" style={{ color: item.typeColor }} />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.title}</span>
                        {item.tags.length > 0 && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {item.tags.map((t) => `#${t}`).join("  ")}
                          </span>
                        )}
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground capitalize shrink-0 pl-2">
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
