"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import type { SidebarData } from "@/lib/db/sidebar";

interface SidebarUser {
  name?: string | null;
  image?: string | null;
}

export default function DashboardShell({
  sidebarData,
  user,
  children,
}: {
  sidebarData: SidebarData;
  user: SidebarUser;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          data={sidebarData}
          user={user}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
