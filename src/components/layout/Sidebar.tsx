"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  ChevronRight,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  mockItemTypes,
  mockCollections,
  mockRecentItems,
  mockItems,
  mockUser,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

const TYPE_SLUGS: Record<string, string> = {
  snippet: "snippets",
  prompt: "prompts",
  command: "commands",
  note: "notes",
  file: "files",
  image: "images",
  link: "links",
};

const PRO_TYPES = new Set(["file", "image"]);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SectionHeader({
  label,
  expanded,
  onToggle,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 mb-1 group"
    >
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      {expanded ? (
        <ChevronDown className="h-3 w-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
      ) : (
        <ChevronRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
      )}
    </button>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  const typeCounts = mockItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.itemTypeId] = (acc[item.itemTypeId] || 0) + 1;
    return acc;
  }, {});

  const initials = mockUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-border shrink-0",
          "transition-all duration-200 ease-in-out",
          // Mobile: fixed overlay, slides in/out
          "fixed inset-y-0 left-0 z-50",
          // Desktop: in-flow, width transitions between full and icon-only
          "md:relative md:inset-auto md:z-auto md:translate-x-0",
          isOpen
            ? "w-60 translate-x-0"
            : "w-60 -translate-x-full md:w-14"
        )}
      >
        {/* ── ICON-ONLY VIEW (desktop collapsed) ── */}
        <div
          className={cn(
            "flex-col h-full items-center",
            isOpen ? "hidden" : "hidden md:flex"
          )}
        >
          <div className="h-12 w-full border-b border-border shrink-0" />
          <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-0.5 w-full">
            {mockItemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon];
              const slug = TYPE_SLUGS[type.name];
              return Icon ? (
                <Link
                  key={type.id}
                  href={`/items/${slug}`}
                  title={slug}
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors mx-auto"
                >
                  <Icon className="h-4 w-4" style={{ color: type.color }} />
                </Link>
              ) : null;
            })}
          </div>
          <div className="border-t border-border p-2 w-full flex justify-center shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </div>

        {/* ── FULL VIEW (expanded) ── */}
        <div
          className={cn(
            "flex-col h-full w-60",
            isOpen ? "flex" : "flex md:hidden"
          )}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-muted-foreground">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            {/* Item Types */}
            <section>
              <SectionHeader
                label="Item Types"
                expanded={typesOpen}
                onToggle={() => setTypesOpen((v) => !v)}
              />
              {typesOpen && (
                <nav>
                  {mockItemTypes.map((type) => {
                    const Icon = ICON_MAP[type.icon];
                    const slug = TYPE_SLUGS[type.name];
                    const count = typeCounts[type.id] || 0;
                    const isPro = PRO_TYPES.has(type.name);

                    return (
                      <Link
                        key={type.id}
                        href={`/items/${slug}`}
                        className="flex items-center gap-2.5 px-3 mx-1 py-1.5 text-sm rounded-sm hover:bg-accent group transition-colors"
                      >
                        {Icon && (
                          <Icon
                            className="h-4 w-4 shrink-0"
                            style={{ color: type.color }}
                          />
                        )}
                        <span className="flex-1 capitalize text-foreground/80 group-hover:text-foreground transition-colors">
                          {slug}
                        </span>
                        {isPro && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-violet-600/20 text-violet-400 font-medium leading-none">
                            Pro
                          </span>
                        )}
                        {count > 0 && (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </section>

            {/* Collections */}
            <section>
              <SectionHeader
                label="Collections"
                expanded={collectionsOpen}
                onToggle={() => setCollectionsOpen((v) => !v)}
              />
              {collectionsOpen && (
                <nav>
                  {mockCollections.map((col) => {
                    const defaultType = mockItemTypes.find(
                      (t) => t.id === col.defaultTypeId
                    );
                    const dotColor = defaultType?.color ?? "#6b7280";

                    return (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center gap-2.5 px-3 mx-1 py-1.5 text-sm rounded-sm hover:bg-accent group transition-colors"
                      >
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="flex-1 truncate text-foreground/80 group-hover:text-foreground transition-colors">
                          {col.name}
                        </span>
                        {col.isFavorite && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </section>

            {/* Recently Used */}
            <section>
              <SectionHeader
                label="Recently Used"
                expanded={recentOpen}
                onToggle={() => setRecentOpen((v) => !v)}
              />
              {recentOpen && (
                <div>
                  {mockRecentItems.map((item) => {
                    const itemType = mockItemTypes.find(
                      (t) => t.id === item.itemTypeId
                    );
                    const Icon = itemType ? ICON_MAP[itemType.icon] : null;

                    return (
                      <button
                        key={item.id}
                        className="w-full flex items-center gap-2.5 px-3 mx-1 py-1.5 text-sm rounded-sm hover:bg-accent group transition-colors text-left"
                      >
                        {Icon && itemType && (
                          <Icon
                            className="h-4 w-4 shrink-0"
                            style={{ color: itemType.color }}
                          />
                        )}
                        <span className="flex-1 truncate text-foreground/80 group-hover:text-foreground transition-colors">
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* User area */}
          <div className="border-t border-border p-3 shrink-0">
            <button className="w-full flex items-center gap-2.5 rounded-md p-2 hover:bg-accent group transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{mockUser.name}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
