import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import ItemsWithDrawer from "@/components/items/ItemsWithDrawer";
import AddItemButton from "@/components/items/AddItemButton";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsTypePage({ params }: PageProps) {
  const { type } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const result = await getItemsByType(userId, type);
  if (!result) notFound();

  const { items, typeName, typeColor } = result;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-1 w-6 rounded-full self-start mt-2.5"
            style={{ backgroundColor: typeColor }}
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold capitalize">{type}</h1>
            <span className="text-sm text-muted-foreground tabular-nums">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
        <AddItemButton type={typeName as "snippet" | "prompt" | "command" | "note" | "link"} label={typeName} />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {typeName}s yet.
        </p>
      ) : (
        <ItemsWithDrawer
          items={items}
          className={
            typeName === "image"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              : typeName === "file"
              ? "flex flex-col gap-1"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          }
          variant={typeName === "image" ? "gallery" : typeName === "file" ? "file-list" : "list"}
        />
      )}
    </div>
  );
}
