"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Star,
  ChevronRight,
  PanelLeft,
  LogOut,
  Settings,
  User,
  Zap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/layout/UserAvatar";
import type { SidebarData } from "@/lib/db/sidebar";
import { ICON_MAP } from "@/lib/item-icons";

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

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25 select-none">
      {label}
    </p>
  );
}

export default function Sidebar({ isOpen, onToggle, data, user }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
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

  function NavLink({
    href,
    isActive,
    children,
  }: {
    href: string;
    isActive: boolean;
    children: React.ReactNode;
  }) {
    return (
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 mx-1 text-sm rounded-lg transition-all group",
          isActive
            ? "bg-violet-500/12 text-white/90 font-medium"
            : "text-white/45 hover:text-white/80 hover:bg-white/5"
        )}
      >
        {isActive && (
          <span className="absolute left-[5px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-500 rounded-full" />
        )}
        {children}
      </Link>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "flex flex-col shrink-0 bg-[#111113] border-r border-white/5",
          "transition-all duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-50",
          "md:relative md:inset-auto md:z-auto md:translate-x-0",
          isOpen
            ? "w-60 translate-x-0"
            : "w-60 -translate-x-full md:w-[52px]"
        )}
      >
        {/* ── ICON-ONLY (collapsed desktop) ── */}
        <div className={cn("flex-col h-full items-center", isOpen ? "hidden" : "hidden md:flex")}>
          <div className="h-[52px] w-full border-b border-white/5 flex items-center justify-center shrink-0">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-0.5 w-full">
            {itemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon];
              const slug = TYPE_SLUGS[type.name];
              const isActive = pathname === `/dashboard/items/${slug}`;
              return Icon ? (
                <Link
                  key={type.id}
                  href={`/dashboard/items/${slug}`}
                  title={type.name}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors mx-auto",
                    isActive
                      ? "bg-violet-500/15 text-violet-400"
                      : "hover:bg-white/5 text-white/40 hover:text-white/70"
                  )}
                >
                  <Icon className="h-4 w-4" style={{ color: isActive ? undefined : type.color }} />
                </Link>
              ) : null;
            })}
          </div>
          <div className="border-t border-white/5 p-2 w-full flex justify-center shrink-0">
            <Link href="/dashboard/profile">
              <UserAvatar image={user.image} name={user.name} className="h-7 w-7" />
            </Link>
          </div>
        </div>

        {/* ── FULL VIEW (expanded) ── */}
        <div className={cn("flex-col h-full w-60", isOpen ? "flex" : "flex md:hidden")}>

          {/* Logo header */}
          <div className="flex items-center justify-between h-[52px] px-3 border-b border-white/5 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-semibold text-white/85 text-sm">Rongeka</span>
            </Link>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5">

            {/* Item Types */}
            <section>
              <SectionLabel label="Library" />
              <nav className="space-y-0.5 relative">
                {itemTypes.map((type) => {
                  const Icon = ICON_MAP[type.icon];
                  const slug = TYPE_SLUGS[type.name];
                  const isPro = PRO_TYPES.has(type.name);
                  const isActive = pathname === `/dashboard/items/${slug}`;
                  return (
                    <div key={type.id} className="relative">
                      <NavLink href={`/dashboard/items/${slug}`} isActive={isActive}>
                        {Icon && (
                          <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                        )}
                        <span className="flex-1 capitalize">{slug}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isPro && (
                            <Badge className="bg-violet-500/15 text-violet-400 border-0 text-[9px] px-1 h-3.5 font-semibold">
                              Pro
                            </Badge>
                          )}
                          {type.itemCount > 0 && (
                            <span className="text-[11px] tabular-nums text-white/25">
                              {type.itemCount}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    </div>
                  );
                })}
              </nav>
            </section>

            {/* Collections */}
            {collections.length > 0 && (
              <section>
                <SectionLabel label="Collections" />
                <nav className="space-y-0.5 relative">
                  {collections.map((col) => {
                    const isActive = pathname === `/dashboard/collections/${col.id}`;
                    return (
                      <div key={col.id} className="relative">
                        <NavLink href={`/dashboard/collections/${col.id}`} isActive={isActive}>
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: col.dominantColor }}
                          />
                          <span className="flex-1 truncate">{col.name}</span>
                          {col.isFavorite && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                          )}
                        </NavLink>
                      </div>
                    );
                  })}
                  <Link
                    href="/dashboard/collections"
                    className="flex items-center gap-2.5 px-3 py-1.5 mx-1 text-xs rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-all"
                  >
                    View all collections
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                </nav>
              </section>
            )}

            {/* Recently Used */}
            {recentItems.length > 0 && (
              <section>
                <SectionLabel label="Recent" />
                <nav className="space-y-0.5 relative">
                  {recentItems.map((item) => {
                    const Icon = ICON_MAP[item.itemType.icon];
                    const slug = TYPE_SLUGS[item.itemType.name];
                    return (
                      <div key={item.id} className="relative">
                        <NavLink href={`/dashboard/items/${slug}?open=${item.id}`} isActive={false}>
                          {Icon && (
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: item.itemType.color }} />
                          )}
                          <span className="flex-1 truncate text-xs">{item.title}</span>
                        </NavLink>
                      </div>
                    );
                  })}
                </nav>
              </section>
            )}
          </div>

          {/* User area */}
          <div className="border-t border-white/5 p-3 shrink-0 relative" ref={menuRef}>
            {menuOpen && (
              <div className="absolute bottom-full left-2 right-2 mb-1.5 rounded-xl border border-white/8 bg-[#1a1a1d] shadow-xl shadow-black/50 overflow-hidden">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <div className="border-t border-white/5" />
                <button
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors group"
            >
              <UserAvatar image={user.image} name={user.name} className="h-7 w-7 shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white/80 truncate leading-none">
                  {user.name ?? "Account"}
                </p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-white/25 shrink-0 group-hover:text-white/50 transition-colors" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
