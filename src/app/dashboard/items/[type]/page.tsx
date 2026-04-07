import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import ItemsWithDrawer from "@/components/items/ItemsWithDrawer";
import AddItemButton from "@/components/items/AddItemButton";
import Pagination from "@/components/ui/Pagination";
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, type LucideIcon } from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
  snippet: Code,
  prompt: Sparkles,
  command: Terminal,
  note: StickyNote,
  file: File,
  image: Image,
  link: Link,
};

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsTypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const userId = session!.user.id;
  const isPro = session!.user.isPro ?? false;

  const PRO_SLUGS: Record<string, string> = { files: "Files", images: "Images" };
  if (PRO_SLUGS[type] && !session!.user.isPro) {
    redirect("/dashboard/upgrade");
  }

  const result = await getItemsByType(userId, type, page);
  if (!result) notFound();

  const { items, typeName, typeColor, totalCount } = result;
  const TypeIcon = TYPE_ICONS[typeName] ?? Code;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  if (totalCount > 0 && page > totalPages) redirect(`/dashboard/items/${type}?page=${totalPages}`);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TypeIcon className="w-5 h-5 shrink-0" style={{ color: typeColor }} />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold capitalize">{type}</h1>
            <span className="text-sm text-muted-foreground tabular-nums">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
        <AddItemButton type={typeName as "snippet" | "prompt" | "command" | "note" | "link"} label={typeName} />
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {typeName}s yet.
        </p>
      ) : (
        <>
          <ItemsWithDrawer
            items={items}
            isPro={isPro}
            className={
              typeName === "image"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                : typeName === "file"
                ? "flex flex-col gap-1"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            }
            variant={typeName === "image" ? "gallery" : typeName === "file" ? "file-list" : "list"}

          />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
