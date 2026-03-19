import { getSidebarData } from "@/lib/db/sidebar";
import { getDemoUserId } from "@/lib/db/users";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getDemoUserId();
  const sidebarData = await getSidebarData(userId);

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}
