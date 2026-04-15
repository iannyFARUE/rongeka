"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette, { useCommandPalette } from "@/components/layout/CommandPalette";
import type { SidebarData } from "@/lib/db/sidebar";
import type { SearchData } from "@/lib/db/search";

interface SidebarUser {
  name?: string | null;
  image?: string | null;
}

export default function DashboardShell({
  sidebarData,
  searchData,
  user,
  isPro,
  children,
}: {
  sidebarData: SidebarData;
  searchData: SearchData;
  user: SidebarUser;
  isPro: boolean;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);
  const { open, setOpen } = useCommandPalette();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TopBar onSearchClick={() => setOpen(true)} onMenuClick={() => setSidebarOpen(true)} isPro={isPro} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          data={sidebarData}
          user={user}
          isPro={isPro}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        searchData={searchData}
      />
    </div>
  );
}
