import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCollectionWithItems } from "@/lib/db/collections";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import ItemsWithDrawer from "@/components/items/ItemsWithDrawer";
import CollectionDetailActions from "@/components/collections/CollectionDetailActions";
import Pagination from "@/components/ui/Pagination";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  const collection = await getCollectionWithItems(userId, id, page);
  if (!collection) notFound();

  const totalPages = Math.ceil(collection.totalItems / COLLECTIONS_PER_PAGE);
  if (collection.totalItems > 0 && page > totalPages) redirect(`/dashboard/collections/${id}?page=${totalPages}`);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-1 w-6 rounded-full self-start mt-2.5"
            style={{ backgroundColor: collection.dominantColor }}
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            )}
            <span className="text-sm text-muted-foreground tabular-nums">
              {collection.totalItems} {collection.totalItems === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
        <CollectionDetailActions
          collectionId={collection.id}
          collectionName={collection.name}
          collectionDescription={collection.description}
          isFavorite={collection.isFavorite}
        />
      </div>

      {collection.totalItems === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
      ) : (
        <>
          {(() => {
            const images = collection.items.filter((i) => i.itemType.name === "image");
            const files = collection.items.filter((i) => i.itemType.name === "file");
            const text = collection.items.filter(
              (i) => i.itemType.name !== "image" && i.itemType.name !== "file"
            );
            return (
              <>
                {images.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Images</h2>
                    <ItemsWithDrawer
                      items={images}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                      variant="gallery"

                    />
                  </section>
                )}
                {files.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Files</h2>
                    <ItemsWithDrawer
                      items={files}
                      className="flex flex-col gap-1"
                      variant="file-list"

                    />
                  </section>
                )}
                {text.length > 0 && (
                  <section className="space-y-3">
                    {(images.length > 0 || files.length > 0) && (
                      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Items</h2>
                    )}
                    <ItemsWithDrawer
                      items={text}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

                    />
                  </section>
                )}
              </>
            );
          })()}
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
