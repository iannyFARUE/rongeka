import { getSidebarData } from "@/lib/db/sidebar";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}
