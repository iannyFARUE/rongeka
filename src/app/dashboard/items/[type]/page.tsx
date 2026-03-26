import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import ItemRow from "@/components/items/ItemRow";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="h-1 w-6 rounded-full"
          style={{ backgroundColor: typeColor }}
        />
        <h1 className="text-lg font-semibold capitalize">{type}</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {typeName}s yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
