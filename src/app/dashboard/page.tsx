export default function DashboardPage() {
  return (
    <>
      <aside className="w-60 border-r border-border p-4 shrink-0 overflow-y-auto">
        <h2 className="text-sm font-semibold text-muted-foreground">Sidebar</h2>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-sm font-semibold text-muted-foreground">Main</h2>
      </main>
    </>
  );
}
