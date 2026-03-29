"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
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
  PanelLeft,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/layout/UserAvatar";
import type { SidebarData } from "@/lib/db/sidebar";

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

interface SidebarUser {
  name?: string | null;
  image?: string | null;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  data: SidebarData;
  user: SidebarUser;
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

export default function Sidebar({ isOpen, onToggle, data, user }: SidebarProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { itemTypes, collections, recentItems } = data;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarClass = "h-7 w-7 shrink-0";

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-border shrink-0",
          "transition-all duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-50",
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
          <div className="h-12 w-full border-b border-border flex items-center justify-center shrink-0">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-0.5 w-full">
            {itemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon];
              const slug = TYPE_SLUGS[type.name];
              return Icon ? (
                <Link
                  key={type.id}
                  href={`/dashboard/items/${slug}`}
                  title={type.name}
                  className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors mx-auto"
                >
                  <Icon className="h-4 w-4" style={{ color: type.color }} />
                </Link>
              ) : null;
            })}
          </div>
          <div className="border-t border-border p-2 w-full flex justify-center shrink-0">
            <Link href="/dashboard/profile">
              <UserAvatar image={user.image} name={user.name} className={avatarClass} />
            </Link>
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
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
              aria-label="Close sidebar"
            >
              <PanelLeft className="h-4 w-4" />
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
                  {itemTypes.map((type) => {
                    const Icon = ICON_MAP[type.icon];
                    const slug = TYPE_SLUGS[type.name];
                    const isPro = PRO_TYPES.has(type.name);

                    return (
                      <Link
                        key={type.id}
                        href={`/dashboard/items/${slug}`}
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
                          <Badge className="bg-violet-600/20 text-violet-400 border-0 text-[10px] px-1.5 h-4">
                            Pro
                          </Badge>
                        )}
                        {type.itemCount > 0 && (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {type.itemCount}
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
                  {collections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/dashboard/collections/${col.id}`}
                      className="flex items-center gap-2.5 px-3 mx-1 py-1.5 text-sm rounded-sm hover:bg-accent group transition-colors"
                    >
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.dominantColor }}
                      />
                      <span className="flex-1 truncate text-foreground/80 group-hover:text-foreground transition-colors">
                        {col.name}
                      </span>
                      {col.isFavorite && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                      )}
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/collections"
                    className="flex items-center gap-2.5 px-3 mx-1 py-1.5 text-xs rounded-sm hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all collections
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                </nav>
              )}
            </section>

            {/* Recently Used */}
            {recentItems.length > 0 && (
              <section>
                <SectionHeader
                  label="Recently Used"
                  expanded={recentOpen}
                  onToggle={() => setRecentOpen((v) => !v)}
                />
                {recentOpen && (
                  <div>
                    {recentItems.map((item) => {
                      const Icon = ICON_MAP[item.itemType.icon];
                      return (
                        <button
                          key={item.id}
                          className="w-full flex items-center gap-2.5 px-3 mx-1 py-1.5 text-sm rounded-sm hover:bg-accent group transition-colors text-left"
                        >
                          {Icon && (
                            <Icon
                              className="h-4 w-4 shrink-0"
                              style={{ color: item.itemType.color }}
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
            )}
          </div>

          {/* User area */}
          <div className="border-t border-border p-3 shrink-0 relative" ref={menuRef}>
            {menuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 rounded-md p-2 hover:bg-accent group transition-colors"
            >
              <UserAvatar image={user.image} name={user.name} className={avatarClass} />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name ?? "Account"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                  menuOpen && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
