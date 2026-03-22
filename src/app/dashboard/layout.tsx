import { auth } from "@/auth";
import { getSidebarData } from "@/lib/db/sidebar";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const sidebarData = await getSidebarData(userId);

  return (
    <DashboardShell
      sidebarData={sidebarData}
      user={{ name: session!.user.name, image: session!.user.image }}
    >
      {children}
    </DashboardShell>
  );
}
