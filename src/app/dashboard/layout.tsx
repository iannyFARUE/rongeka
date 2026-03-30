import { auth } from "@/auth";
import { getSidebarData } from "@/lib/db/sidebar";
import { getSearchData } from "@/lib/db/search";
import DashboardShell from "@/components/layout/DashboardShell";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const [sidebarData, searchData] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
  ]);

  return (
    <>
      <DashboardShell
        sidebarData={sidebarData}
        searchData={searchData}
        user={{ name: session!.user.name, image: session!.user.image }}
      >
        {children}
      </DashboardShell>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
