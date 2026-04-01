import { auth } from "@/auth";
import { getSidebarData } from "@/lib/db/sidebar";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import DashboardShell from "@/components/layout/DashboardShell";
import { EditorPreferencesProvider } from "@/context/EditorPreferencesContext";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const [sidebarData, searchData, editorPreferences] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getEditorPreferences(userId),
  ]);

  return (
    <>
      <EditorPreferencesProvider preferences={editorPreferences}>
        <DashboardShell
          sidebarData={sidebarData}
          searchData={searchData}
          user={{ name: session!.user.name, image: session!.user.image }}
        >
          {children}
        </DashboardShell>
      </EditorPreferencesProvider>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
